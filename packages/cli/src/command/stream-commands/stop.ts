import type { CommandModule } from 'yargs'

import type { CommonOptions } from '../../common-options.js'

export const command: CommandModule<CommonOptions, CommonOptions> = {
  command: 'stop',
  describe: 'Stop stream',

  async handler({ client }): Promise<void> {
    await client.stopStream()
  },
}
