import type { ChannelID, NetworkKey } from '@methadone/types'

import type { Channel } from '#domain/channel/channel.js'
import type { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import type { Network } from '#domain/network/network.js'

export abstract class IAudioAddictAPI {
  public abstract getNetworks(): Promise<Network[]>
  public abstract getChannels(key: NetworkKey): Promise<Channel[]>
  public abstract getChannelFilters(key: NetworkKey): Promise<ChannelFilter[]>
  public abstract getCurrentlyPlaying(
    key: NetworkKey,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>>
  public abstract getStreamURL(networkKey: NetworkKey, channel: Channel): Promise<string>
  public abstract ping(): Promise<void>
}
