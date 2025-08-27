import { Channel, type ChannelKey } from '#domain/channel/channel.js'
import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import type { NetworkKey } from '#domain/network/network.js'

export abstract class IChannelService {
  public abstract get(networkKey: NetworkKey, channelKey: ChannelKey): Promise<Channel>
  public abstract getCurrentlyPlaying(
    networkKey: NetworkKey,
    channelKey: ChannelKey,
  ): Promise<CurrentlyPlaying | null>
  public abstract getAllForNetwork(networkKey: NetworkKey): Promise<Channel[]>
}
