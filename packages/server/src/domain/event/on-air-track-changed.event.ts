import { type Channel, type CurrentlyPlayingTrack } from '../audio-addict'

export class OnAirTrackChangedEvent {
    public readonly channel: Channel

    public readonly track: CurrentlyPlayingTrack | null

    public constructor(data: {
        channel: Channel
        track: CurrentlyPlayingTrack | null
    }) {
        this.channel = data.channel
        this.track = data.track
    }
}
