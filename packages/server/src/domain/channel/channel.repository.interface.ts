import type { ChannelID, ChannelKey, NetworkID } from '@methadone/types'

import type { Channel } from './channel.js'

export abstract class IChannelRepository {
  public abstract getByID(channelId: ChannelID): Promise<Channel>
  public abstract getByKeyForNetwork(networkId: NetworkID, channelKey: ChannelKey): Promise<Channel>
  public abstract getAll(): Promise<Channel[]>
  public abstract getAllForNetwork(networkId: NetworkID): Promise<Channel[]>
  public abstract insert(channel: Channel): Promise<Channel>
}
