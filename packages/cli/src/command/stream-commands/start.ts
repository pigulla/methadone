import { asChannelKey, asNetworkKey } from '@methadone/types'

import { select } from '@inquirer/prompts'
import type { CommandModule } from 'yargs'

import type { CommonOptions } from '../../common-options.js'

export const command: CommandModule<CommonOptions, CommonOptions> = {
  command: 'start',
  describe: 'Start stream',

  builder(argv) {
    return argv.options({
      network: {
        alias: 'n',
        requiresArg: true,
        required: false,
        type: 'string',
        description: 'Select network',
      },
      channel: {
        alias: 'c',
        requiresArg: true,
        required: false,
        type: 'string',
        description: 'Select channel',
      },
    })
  },

  async handler({ client, network, channel }): Promise<void> {
    if (network === undefined) {
      const networks = await client.getNetworks()
      network = await select({
        message: 'Select a network',
        choices: networks
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(network => ({
            value: network.key,
            name: network.name,
          })),
      })
    }

    const networkKey = asNetworkKey(network)

    if (channel === undefined) {
      const channels = await client.getChannels(networkKey)
      channel = await select({
        message: 'Select a channel',
        choices: channels
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(channel => ({
            value: channel.key,
            name: channel.name,
            description: channel.description,
          })),
      })
    }

    const channelKey = asChannelKey(channel)

    await client.startStream({ networkKey, channelKey })
  },
}
