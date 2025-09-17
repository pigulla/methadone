import type { ChannelFilterKey, NetworkKey } from '@digitally-exported/types'

import { ChannelFilter } from '#domain/channel-filter/channel-filter.js'

export abstract class IChannelFilterService {
  public abstract get(
    networkKey: NetworkKey,
    channelFilterKey: ChannelFilterKey,
  ): Promise<ChannelFilter>
  public abstract getAll(): Promise<ChannelFilter[]>
  public abstract getAllForNetwork(key: NetworkKey): Promise<ChannelFilter[]>
}
