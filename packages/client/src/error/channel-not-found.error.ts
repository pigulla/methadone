import type { ChannelKey } from '@methadone/types'

import { NotFoundError } from './not-found.error.js'

export class ChannelNotFoundError extends NotFoundError {
  public readonly channelKey: ChannelKey

  public constructor(channelKey: ChannelKey) {
    super(`Channel with key "${channelKey}" was not found`)

    this.channelKey = channelKey
  }
}
