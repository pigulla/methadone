import type { ChannelFilterKey } from '@digitally-exported/types'

import { NotFoundError } from './not-found.error.js'

export class ChannelFilterNotFoundError extends NotFoundError {
  public readonly channelFilterKey: ChannelFilterKey

  public constructor(channelFilterKey: ChannelFilterKey) {
    super(`Channel filter with key "${channelFilterKey}" was not found`)

    this.channelFilterKey = channelFilterKey
  }
}
