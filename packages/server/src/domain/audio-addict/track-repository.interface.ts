import { type Track, type TrackID } from './track'

export abstract class ITrackRepository {
    public abstract insertTrack(track: Track): void

    public abstract findTrack(trackId: TrackID): Track | null

    public abstract getTrack(trackId: TrackID): Track
}
