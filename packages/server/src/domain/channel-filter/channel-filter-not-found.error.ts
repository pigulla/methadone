import type { ChannelFilterID, ChannelFilterKey } from '@digitally-exported/types'

import { EntityNotFoundError } from '../entity-not-found.error.js'

export class ChannelFilterNotFoundError extends EntityNotFoundError {
  public constructor(identifier: ChannelFilterID | ChannelFilterKey) {
    super(
      `Channel Filter with ${typeof identifier === 'number' ? 'id' : 'key'} "${identifier}" not found`,
    )
  }
}
