import type { CommandModule } from 'yargs'

import type { CommonOptions } from '../common-options.js'

import { command as startCommand } from './stream-commands/start.js'
import { command as stopCommand } from './stream-commands/stop.js'

export const command: CommandModule<CommonOptions, CommonOptions> = {
  command: 'stream',
  describe: 'Manage stream',

  builder(argv) {
    return argv.command([startCommand, stopCommand] as CommandModule[]).demandCommand()
  },

  handler(_argv): void {
    // This should never be called due to the above demandCommand()
  },
}
