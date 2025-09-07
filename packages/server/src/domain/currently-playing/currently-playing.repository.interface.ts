import type { ChannelID, NetworkID } from '@methadone/types'

import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'

export abstract class ICurrentlyPlayingRepository {
  public abstract deleteAll(): Promise<void>
  public abstract get(id: ChannelID): Promise<CurrentlyPlaying | null>
  public abstract getForNetwork(id: NetworkID): Promise<Map<ChannelID, CurrentlyPlaying | null>>
  public abstract getAll(): Promise<Map<ChannelID, CurrentlyPlaying | null>>
  public abstract upsert(channelId: ChannelID, nowPlaying: CurrentlyPlaying | null): Promise<void>
}
