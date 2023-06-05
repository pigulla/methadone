import {
    type Artist,
    type ArtistID,
    type Channel,
    type ChannelFilter,
    type ChannelFilterID,
    type ChannelID,
    type ChannelKey,
    type CurrentlyPlayingTrack,
    type Network,
    type NetworkKey,
    type Quality,
    type Track,
    type TrackID,
} from '../../domain/audio-addict'
import { type ETag } from '../etag'

export const NOT_MODIFIED = Symbol('not-modified')

export type ETaggedValue<T> = { eTag: ETag; value: T }

export type ETagged<T> = ETaggedValue<T> | typeof NOT_MODIFIED

export abstract class IETagAwareAudioAddictApi {
    public abstract getStreamUrls(data: {
        networkKey: NetworkKey
        channelKey: ChannelKey
        quality: Quality
        eTag: ETag | null
    }): Promise<ETagged<Set<string>>>

    public abstract getTrack(data: {
        trackId: TrackID
        eTag: ETag | null
    }): Promise<ETagged<Track>>

    public abstract getArtist(data: {
        artistId: ArtistID
        eTag: ETag | null
    }): Promise<ETagged<Artist>>

    public abstract getChannels(data: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<Channel[]>>

    public abstract getChannel(data: {
        channelId: ChannelID
        eTag: ETag | null
    }): Promise<ETagged<Channel>>

    public abstract getChannelByKey(data: {
        networkKey: NetworkKey
        channelKey: ChannelKey
        eTag: ETag | null
    }): Promise<ETagged<Channel>>

    public abstract getChannelFilters(data: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<ChannelFilter[]>>

    public abstract getChannelFilter(data: {
        channelFilterId: ChannelFilterID
        eTag: ETag | null
    }): Promise<ETagged<ChannelFilter>>

    public abstract getNetworks(data: {
        eTag: ETag | null
    }): Promise<ETagged<Network[]>>

    public abstract getNetworkByKey(data: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<Network>>

    public abstract getCurrentlyPlaying(data: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<Map<ChannelID, CurrentlyPlayingTrack | null>>>
}
