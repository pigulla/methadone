import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { HandleError, HandlerAction } from 'shumway'
import superagent, { type Response, type SuperAgentStatic } from 'superagent'
import { type JsonObject, type JsonValue } from 'type-fest'

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
    Quality,
    type Track,
    type TrackID,
} from '../../domain/audio-addict'
import {
    ArtistNotFoundError,
    ChannelFilterNotFoundError,
    ChannelNotFoundError,
    NetworkNotFoundError,
    TrackNotFoundError,
} from '../../domain/audio-addict/error'
import { type ETag } from '../etag'

import {
    DefaultHttpErrorHandler,
    FallbackErrorHandler,
    isHttpError,
    TimeoutErrorHandler,
    ValidationErrorHandler,
} from './api-error-handler'
import { MissingETagError } from './audio-addict-api.error'
import {
    ArtistDTO,
    ChannelDTO,
    ChannelFilterDTO,
    CurrentlyPlayingDTO,
    NetworkDTO,
    TrackDTO,
} from './dto'
import {
    type ETagged,
    type IETagAwareAudioAddictApi,
    NOT_MODIFIED,
} from './etag-aware-audio-addict-api.interface'

const encode = encodeURIComponent

function okOrNotModified(response: Response): boolean {
    return (
        response.status === HttpStatus.OK ||
        response.status === HttpStatus.NOT_MODIFIED
    )
}

function eTagged<T, S extends JsonValue = JsonObject>(
    response: Response,
    fn: (value: S) => T,
): ETagged<T> {
    if (response.status === HttpStatus.NOT_MODIFIED) {
        return NOT_MODIFIED
    }

    const newETag = response.get('etag')
    if (!newETag) {
        throw new MissingETagError()
    }

    const value = fn(response.body as S)

    return { value, eTag: newETag as ETag }
}

@Injectable()
export class ETagAwareAudioAddictApi implements IETagAwareAudioAddictApi {
    private static readonly BASE_URL = 'https://api.audioaddict.com/v1'
    private static readonly QUALITY_SUFFIXES: Readonly<
        Record<Quality, string>
    > = {
            [Quality.AAC_128]: '',
            [Quality.AAC_64]: '_medium',
            [Quality.MP3_320]: '_high',
        }

    // All AudioAddict API endpoints are scoped to a Network and this require a network key. However, some resources are
    // unique across networks (such as channels and tracks), so it makes little sense to require a network key in the
    // exposed interface. In these cases, we just use 'di' as a default. Not great, but good enough.
    public static readonly STATIC_NETWORK_KEY: NetworkKey = 'di' as NetworkKey

    private readonly client: SuperAgentStatic
    private readonly logger: PinoLogger

    public constructor(
        @InjectPinoLogger(ETagAwareAudioAddictApi.name)
            logger: PinoLogger,
    ) {
        this.client = superagent
            .agent()
            .accept('application/json')
            .retry(1)
            .timeout({ deadline: 5_000 })
        this.logger = logger
    }

    @HandleError<ETagAwareAudioAddictApi['getStreamUrls']>(
        TimeoutErrorHandler,
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getStreamUrls({
        networkKey,
        channelKey,
        quality,
        eTag,
    }: {
        networkKey: NetworkKey
        channelKey: ChannelKey
        quality: Quality
        eTag: ETag | null
    }): Promise<ETagged<Set<string>>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    networkKey,
                )}/listen/premium${encode(
                    ETagAwareAudioAddictApi.QUALITY_SUFFIXES[quality],
                )}/${encode(channelKey)}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Set<string>, string[]>(response, body =>
            body.reduce((set, url) => set.add(url), new Set<string>()),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getArtist']>(
        TimeoutErrorHandler,
        {
            predicate: isHttpError(HttpStatus.NOT_FOUND),
            action: HandlerAction.MAP,
            callback: (error, { artistId }) =>
                new ArtistNotFoundError(artistId),
        },
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getArtist({
        artistId,
        eTag,
    }: {
        artistId: ArtistID
        eTag: ETag | null
    }): Promise<ETagged<Artist>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    ETagAwareAudioAddictApi.STATIC_NETWORK_KEY,
                )}/artists/${encode(artistId)}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Artist>(response, body =>
            ArtistDTO.fromJSON(body).toDomain(),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getTrack']>(
        TimeoutErrorHandler,
        {
            predicate: isHttpError(HttpStatus.NOT_FOUND),
            action: HandlerAction.MAP,
            callback: (error, { trackId }) => new TrackNotFoundError(trackId),
        },
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getTrack({
        trackId,
        eTag,
    }: {
        trackId: TrackID
        eTag: ETag | null
    }): Promise<ETagged<Track>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    ETagAwareAudioAddictApi.STATIC_NETWORK_KEY,
                )}/tracks/${encode(trackId)}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Track>(response, body =>
            TrackDTO.fromJSON(body).toDomain(),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getChannels']>(
        TimeoutErrorHandler,
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getChannels({
        networkKey,
        eTag,
    }: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<Channel[]>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    networkKey,
                )}/channels`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Channel[], JsonObject[]>(response, body =>
            body.map(item => ChannelDTO.fromJSON(item).toDomain()),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getChannel']>(
        TimeoutErrorHandler,
        {
            predicate: isHttpError(HttpStatus.NOT_FOUND),
            action: HandlerAction.MAP,
            callback: (error, { channelId }) =>
                new ChannelNotFoundError(channelId),
        },
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getChannel({
        channelId,
        eTag,
    }: {
        channelId: ChannelID
        eTag: ETag | null
    }): Promise<ETagged<Channel>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    ETagAwareAudioAddictApi.STATIC_NETWORK_KEY,
                )}/channels/${encode(channelId)}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Channel>(response, body =>
            ChannelDTO.fromJSON(body).toDomain(),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getChannelByKey']>(
        TimeoutErrorHandler,
        {
            predicate: isHttpError(HttpStatus.NOT_FOUND),
            action: HandlerAction.MAP,
            callback: (error, { channelKey }) =>
                new ChannelNotFoundError(channelKey),
        },
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getChannelByKey({
        networkKey,
        channelKey,
        eTag,
    }: {
        networkKey: NetworkKey
        channelKey: ChannelKey
        eTag: ETag | null
    }): Promise<ETagged<Channel>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    networkKey,
                )}/channels/key/${encode(channelKey)}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Channel>(response, body =>
            ChannelDTO.fromJSON(body).toDomain(),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getNetworks']>(
        TimeoutErrorHandler,
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getNetworks({
        eTag,
    }: {
        eTag: ETag | null
    }): Promise<ETagged<Network[]>> {
        const response = await this.client
            .get(`${ETagAwareAudioAddictApi.BASE_URL}/networks`)
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Network[], JsonObject[]>(response, body =>
            body.map(item => NetworkDTO.fromJSON(item).toDomain()),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getNetworkByKey']>(
        TimeoutErrorHandler,
        {
            predicate: isHttpError(HttpStatus.NOT_FOUND),
            action: HandlerAction.MAP,
            callback: (error, { networkKey }) =>
                new NetworkNotFoundError(networkKey),
        },
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getNetworkByKey({
        networkKey,
        eTag,
    }: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<Network>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/networks/${encode(
                    networkKey,
                )}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<Network>(response, body =>
            NetworkDTO.fromJSON(body).toDomain(),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getCurrentlyPlaying']>(
        TimeoutErrorHandler,
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getCurrentlyPlaying({
        networkKey,
        eTag,
    }: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<Map<ChannelID, CurrentlyPlayingTrack | null>>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    networkKey,
                )}/currently_playing`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<
            Map<ChannelID, CurrentlyPlayingTrack | null>,
            JsonObject[]
        >(response, body =>
            body
                .map(item => CurrentlyPlayingDTO.fromJSON(item))
                .reduce(
                    (map, item) =>
                        map.set(
                            item.channel_id,
                            item.track?.toDomain() ?? null,
                        ),
                    new Map<ChannelID, CurrentlyPlayingTrack | null>(),
                ),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getChannelFilters']>(
        TimeoutErrorHandler,
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getChannelFilters({
        networkKey,
        eTag,
    }: {
        networkKey: NetworkKey
        eTag: ETag | null
    }): Promise<ETagged<ChannelFilter[]>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    networkKey,
                )}/channel_filters`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<ChannelFilter[], JsonObject[]>(response, body =>
            body
                .map(item => ChannelFilterDTO.fromJSON(item))
                .sort(
                    (a, b) =>
                        (a.position ?? Number.MAX_SAFE_INTEGER) -
                        (b.position ?? Number.MAX_SAFE_INTEGER),
                )
                .map(item => item.toDomain()),
        )
    }

    @HandleError<ETagAwareAudioAddictApi['getChannelFilter']>(
        TimeoutErrorHandler,
        {
            predicate: isHttpError(HttpStatus.NOT_FOUND),
            action: HandlerAction.MAP,
            callback: (error, { channelFilterId }) =>
                new ChannelFilterNotFoundError(channelFilterId),
        },
        DefaultHttpErrorHandler,
        ValidationErrorHandler,
        FallbackErrorHandler,
    )
    public async getChannelFilter({
        channelFilterId,
        eTag,
    }: {
        channelFilterId: ChannelFilterID
        eTag: ETag | null
    }): Promise<ETagged<ChannelFilter>> {
        const response = await this.client
            .get(
                `${ETagAwareAudioAddictApi.BASE_URL}/${encode(
                    ETagAwareAudioAddictApi.STATIC_NETWORK_KEY,
                )}/channel_filters/${encode(channelFilterId)}`,
            )
            .set('If-None-Match', eTag ?? '')
            .ok(okOrNotModified)

        return eTagged<ChannelFilter>(response, body =>
            ChannelFilterDTO.fromJSON(body).toDomain(),
        )
    }
}
