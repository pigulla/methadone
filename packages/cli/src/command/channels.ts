import type { CommandModule } from 'yargs'

import type { CommonOptions } from '../common-options.js'

import { command as listCommand } from './channels-commands/list.js'

export const command: CommandModule<CommonOptions, CommonOptions> = {
  command: 'channels',
  describe: 'Information about available channels',

  builder(argv) {
    return argv.command([listCommand] as CommandModule[]).demandCommand()
  },

  handler(_argv): void {
    // This should never be called due to the above demandCommand()
  },
}
