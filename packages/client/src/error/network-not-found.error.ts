import type { NetworkKey } from '@digitally-exported/types'

import { NotFoundError } from './not-found.error.js'

export class NetworkNotFoundError extends NotFoundError {
  public readonly networkKey: NetworkKey

  public constructor(networkKey: NetworkKey) {
    super(`Network with key "${networkKey}" was not found`)

    this.networkKey = networkKey
  }
}
