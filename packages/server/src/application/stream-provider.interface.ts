import type { Writable } from 'node:stream'

import type { AudioFormat } from '#domain/audio-format.js'
import type { Channel } from '#domain/channel/channel.js'
import type { Network } from '#domain/network/network.js'

export type StreamInformation = {
  readonly track: string
  readonly channel: Channel
  readonly network: Network
}

export abstract class IStreamManager {
  public abstract readonly format: AudioFormat

  public abstract streamTo(channel: Channel, stream: Writable): Promise<void>
  public abstract start(channel: Channel): Promise<void>
  public abstract stop(): void
  public abstract getInformation(): StreamInformation | null
}
