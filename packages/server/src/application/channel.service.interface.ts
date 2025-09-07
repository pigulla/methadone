import type { ChannelID, ChannelKey, NetworkKey } from '@methadone/types'

import { Channel } from '#domain/channel/channel.js'
import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'

export abstract class IChannelService {
  public abstract get(networkKey: NetworkKey, channelKey: ChannelKey): Promise<Channel>
  public abstract getCurrentlyPlayingOnChannel(
    networkKey: NetworkKey,
    channelKey: ChannelKey,
  ): Promise<CurrentlyPlaying | null>
  public abstract getCurrentlyPlayingOnNetwork(
    networkKey: NetworkKey,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>>
  public abstract getAllForNetwork(networkKey: NetworkKey): Promise<Channel[]>
}
