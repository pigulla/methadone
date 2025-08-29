import type { Channel } from '#domain/channel/channel.js'

export abstract class IPlayer {
  public abstract play(channel: Channel): Promise<void>
  public abstract stop(): Promise<void>
}
