import type { ChannelID } from '#domain/channel/channel.js'
import type { NetworkID } from '#domain/network/network.js'

import type { CurrentlyPlaying } from '/currently-playing.js'

export abstract class ICurrentlyPlayingRepository {
  public abstract deleteAll(): Promise<void>
  public abstract get(id: ChannelID): Promise<CurrentlyPlaying>
  public abstract getForNetwork(id: NetworkID): Promise<Map<ChannelID, CurrentlyPlaying>>
  public abstract getAll(): Promise<Map<ChannelID, CurrentlyPlaying>>
  public abstract upsert(nowPlaying: CurrentlyPlaying): Promise<void>
}
