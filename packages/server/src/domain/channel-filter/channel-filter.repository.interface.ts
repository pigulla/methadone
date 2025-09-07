import type { ChannelFilterID, ChannelFilterKey, NetworkID } from '@methadone/types'

import { ChannelFilter } from './channel-filter.js'

export abstract class IChannelFilterRepository {
  public abstract getByID(id: ChannelFilterID): Promise<ChannelFilter>
  public abstract getByKeyForNetwork(
    networkId: NetworkID,
    key: ChannelFilterKey,
  ): Promise<ChannelFilter>
  public abstract getAll(): Promise<ChannelFilter[]>
  public abstract getAllForNetwork(id: NetworkID): Promise<ChannelFilter[]>
  public abstract insert(channelFilter: ChannelFilter): Promise<ChannelFilter>
}
