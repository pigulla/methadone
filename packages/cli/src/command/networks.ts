import type { CommandModule } from 'yargs'

import type { CommonOptions } from '../common-options.js'

import { command as listCommand } from './networks-commands/list.js'

export const command: CommandModule<CommonOptions, CommonOptions> = {
  command: 'networks',
  describe: 'Information about available networks',

  builder(argv) {
    return argv.command([listCommand] as CommandModule[]).demandCommand()
  },

  handler(_argv): void {
    // This should never be called due to the above demandCommand()
  },
}
