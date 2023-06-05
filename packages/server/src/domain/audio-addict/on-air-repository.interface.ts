import { type ChannelID } from './channel'
import { type OnAirTrack } from './on-air-track'

export abstract class IOnAirRepository {
    public abstract getOnAir(channelId: ChannelID): OnAirTrack | null
}
