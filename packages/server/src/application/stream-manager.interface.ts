import type { Readable, Writable } from 'node:stream'

import type { Channel } from '#domain/channel/channel.js'
import type { Network } from '#domain/network/network.js'

export type StreamInformation = {
  readonly track: string
  readonly channel: Channel
  readonly network: Network
}

export abstract class IStreamManager {
  public abstract getMimeType(): string
  public abstract getStream(): Readable
  public abstract startStream(channel: Channel): Promise<void>
  public abstract startStreamTo(channel: Channel, destination: Writable): Promise<void>
  public abstract stop(): void
  public abstract getInformation(): StreamInformation | null
}
