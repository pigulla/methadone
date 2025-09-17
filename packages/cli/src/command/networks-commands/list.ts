import { EOL } from 'node:os'

import { NetworkDTO } from '@digitally-exported/dto'

import chalk from 'chalk'
import type { JsonObject } from 'type-fest'
import type { CommandModule } from 'yargs'

import type { CommonOptions, TextFormatter } from '../../common-options.js'

const formatter = {
  text(value: NetworkDTO[]): string {
    return value
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(network => [
        `• ${chalk.bold(network.name)} ${chalk.grey(`(${network.key})`)}`,
        `  ${chalk.italic(network.url)}`,
      ])
      .join(EOL)
  },
  plain(value: NetworkDTO[]): string {
    return value
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(network => [`• ${network.name} (${network.key})`, `  ${network.url}`])
      .join(EOL)
  },
} satisfies Record<string, TextFormatter<NetworkDTO[]>>

export const command: CommandModule<CommonOptions<NetworkDTO[]>, CommonOptions<NetworkDTO[]>> = {
  command: 'list',
  describe: 'List all networks',

  async handler({ client, format }): Promise<void> {
    const networks = await client.getNetworks()
    const json = networks.map<JsonObject>(network => ({ ...network }))

    process.stdout.write(format(json, formatter))
  },
}
