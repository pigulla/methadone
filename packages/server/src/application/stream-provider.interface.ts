import type { PassThrough } from 'node:stream'

import type { Channel } from '#domain/channel/channel.js'
import type { Network } from '#domain/network/network.js'

export abstract class IStreamProvider {
  public abstract stream: PassThrough

  public abstract start(channel: Channel): Promise<void>
  public abstract stop(): void
  public abstract getInformation(): {
    track: string
    channel: Channel
    network: Network
  } | null
}
