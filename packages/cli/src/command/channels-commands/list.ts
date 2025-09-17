import { EOL } from 'node:os'

import { ChannelDTO } from '@digitally-exported/dto'
import { asNetworkKey } from '@digitally-exported/types'

import chalk from 'chalk'
import type { JsonObject } from 'type-fest'
import type { CommandModule } from 'yargs'

import type { CommonOptions, TextFormatter } from '../../common-options.js'

const formatter = {
  text(value: ChannelDTO[]): string {
    return value
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(channel => [
        `• ${chalk.bold(channel.name)} ${chalk.grey(`(${channel.key})`)}`,
        `  ${chalk.italic(channel.description)}`,
      ])
      .join(EOL)
  },
  plain(value: ChannelDTO[]): string {
    return value
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(channel => [`• ${channel.name} (${channel.key})`, `  ${channel.description}`])
      .join(EOL)
  },
} satisfies Record<string, TextFormatter<ChannelDTO[]>>

export const command: CommandModule<CommonOptions<ChannelDTO[]>, CommonOptions<ChannelDTO[]>> = {
  command: 'list',
  describe: 'List all channels',

  builder(argv) {
    return argv.option('network', {
      alias: 'n',
      requiresArg: true,
      required: true,
      type: 'string',
      description: 'Only show channels for this network',
    })
  },

  async handler({ client, network, format }): Promise<void> {
    const channels = await client.getChannels(asNetworkKey(network))
    const json = channels.map<JsonObject>(channel => ({ ...channel }))

    process.stdout.write(format(json, formatter))
  },
}
