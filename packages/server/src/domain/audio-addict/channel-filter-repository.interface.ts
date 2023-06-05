import {
    type ChannelFilter,
    type ChannelFilterID,
    type ChannelFilterKey,
} from './channel-filter'
import { type NetworkID } from './network'

export abstract class IChannelFilterRepository {
    public abstract insertChannelFilter(channelFilter: ChannelFilter): void

    public abstract getChannelFilters(): ChannelFilter[]

    public abstract getChannelFilter(
        channelFilterId: ChannelFilterID,
    ): ChannelFilter

    public abstract getChannelFilter(
        channelFilterKey: ChannelFilterKey,
        networkId: NetworkID,
    ): ChannelFilter

    public abstract getChannelFiltersForNetwork(
        networkId: NetworkID,
    ): ChannelFilter[]
}
