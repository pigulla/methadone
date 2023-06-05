import { type Channel, type ChannelID, type ChannelKey } from './channel'
import { type NetworkID } from './network'

export abstract class IChannelRepository {
    public abstract insertChannel(channel: Channel): void

    public abstract getChannels(): Channel[]
    public abstract getChannels(networkId: NetworkID): Channel[]

    public abstract getChannel(channelId: ChannelID): Channel
    public abstract getChannel(
        channelKey: ChannelKey,
        networkId: NetworkID,
    ): Channel
}
