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
} from '../domain/audio-addict'

export abstract class IAudioAddictApi {
    public abstract getStreamUrls(data: {
        networkKey: NetworkKey
        channelKey: ChannelKey
        quality: Quality
    }): Promise<Set<string>>

    public abstract getTrack(trackId: TrackID): Promise<Track>

    public abstract getArtist(artistId: ArtistID): Promise<Artist>

    public abstract getChannels(networkKey: NetworkKey): Promise<Channel[]>

    public abstract getChannel(channelId: ChannelID): Promise<Channel>

    public abstract getChannelByKey(
        networkKey: NetworkKey,
        channelKey: ChannelKey,
    ): Promise<Channel>

    public abstract getChannelFilters(
        networkKey: NetworkKey,
    ): Promise<ChannelFilter[]>

    public abstract getChannelFilter(
        channelFilterId: ChannelFilterID,
    ): Promise<ChannelFilter>

    public abstract getNetworks(): Promise<Network[]>

    public abstract getNetworkByKey(key: NetworkKey): Promise<Network>

    public abstract getCurrentlyPlaying(
        networkKey: NetworkKey,
    ): Promise<Map<ChannelID, CurrentlyPlayingTrack | null>>
}
