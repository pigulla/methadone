import { type Channel, type Track } from '../audio-addict'

export class OnAirTrackChangedEvent {
    public readonly channel: Channel

    public readonly track: Track | null

    public constructor(data: { channel: Channel; track: Track | null }) {
        this.channel = data.channel
        this.track = data.track
    }
}
