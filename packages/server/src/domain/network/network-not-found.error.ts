import type { NetworkID, NetworkKey } from '@digitally-exported/types'

import { EntityNotFoundError } from '../entity-not-found.error.js'

export class NetworkNotFoundError extends EntityNotFoundError {
  public constructor(identifier: NetworkID | NetworkKey) {
    super(`Network with ${typeof identifier === 'number' ? 'id' : 'key'} "${identifier}" not found`)
  }
}
