import { Injectable } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { type AsyncReturnType } from 'type-fest'

import { type IAudioAddictApi } from '../../application'
import { type ETag } from '../etag'

import {
    type ETagged,
    type ETaggedValue,
    IETagAwareAudioAddictApi,
    NOT_MODIFIED,
} from './etag-aware-audio-addict-api.interface'

@Injectable()
export class CachingAudioAddictApi implements IAudioAddictApi {
    private readonly api: IETagAwareAudioAddictApi
    private readonly logger: PinoLogger

    public constructor(
        api: IETagAwareAudioAddictApi,
        @InjectPinoLogger(CachingAudioAddictApi.name)
        logger: PinoLogger,
    ) {
        this.api = api
        this.logger = logger
    }

    private withETagCache<T extends keyof IAudioAddictApi>({
        method,
        getCacheKey,
        getValue,
    }: {
        method: T
        getCacheKey: (...args: Parameters<IAudioAddictApi[T]>) => string
        getValue: (
            eTag: ETag | null,
            ...args: Parameters<IAudioAddictApi[T]>
        ) => Promise<ETagged<AsyncReturnType<IAudioAddictApi[T]>>>
    }): (
        ...args: Parameters<IAudioAddictApi[T]>
    ) => Promise<AsyncReturnType<IAudioAddictApi[T]>> {
        const cache: Map<
            string,
            ETaggedValue<AsyncReturnType<IAudioAddictApi[T]>>
        > = new Map()

        return async (
            ...args: Parameters<IAudioAddictApi[T]>
        ): Promise<AsyncReturnType<IAudioAddictApi[T]>> => {
            const cacheKey = getCacheKey(...args)
            const cached = cache.get(cacheKey)
            const details = { method, cacheKey }
            let result: ETagged<AsyncReturnType<IAudioAddictApi[T]>>

            if (cached) {
                const { eTag, value } = cached
                result = await getValue(eTag, ...args)

                if (result === NOT_MODIFIED) {
                    this.logger.trace(details, 'Returning fresh cache entry')
                    return value
                }

                this.logger.trace(details, `Cached data is outdated`)
            }

            result = (await getValue(null, ...args)) as Exclude<
                ETagged<AsyncReturnType<IAudioAddictApi[T]>>,
                typeof NOT_MODIFIED
            >
            this.logger.trace(details, `Cache updated`)
            cache.set(cacheKey, result)
            return result.value
        }
    }

    public readonly getStreamUrls = this.withETagCache<'getStreamUrls'>({
        method: 'getStreamUrls',
        getCacheKey: data =>
            [data.networkKey, data.channelKey, data.quality].join(':'),
        getValue: (eTag, data) => this.api.getStreamUrls({ ...data, eTag }),
    })

    public readonly getArtist = this.withETagCache<'getArtist'>({
        method: 'getArtist',
        getCacheKey: artistId => artistId.toString(10),
        getValue: (eTag, artistId) => this.api.getArtist({ artistId, eTag }),
    })

    public readonly getTrack = this.withETagCache<'getTrack'>({
        method: 'getTrack',
        getCacheKey: trackId => trackId.toString(10),
        getValue: (eTag, trackId) => this.api.getTrack({ trackId, eTag }),
    })

    public readonly getChannels = this.withETagCache<'getChannels'>({
        method: 'getChannels',
        getCacheKey: networkKey => networkKey,
        getValue: (eTag, networkKey) =>
            this.api.getChannels({ networkKey, eTag }),
    })

    public readonly getChannel = this.withETagCache<'getChannel'>({
        method: 'getChannel',
        getCacheKey: channelId => channelId.toString(10),
        getValue: (eTag, channelId) => this.api.getChannel({ channelId, eTag }),
    })

    public readonly getChannelByKey = this.withETagCache<'getChannelByKey'>({
        method: 'getChannelByKey',
        getCacheKey: channelKey => channelKey,
        getValue: (eTag, networkKey, channelKey) =>
            this.api.getChannelByKey({ networkKey, channelKey, eTag }),
    })

    public readonly getNetworks = this.withETagCache<'getNetworks'>({
        method: 'getNetworks',
        getCacheKey: () => '',
        getValue: eTag => this.api.getNetworks({ eTag }),
    })

    public readonly getNetworkByKey = this.withETagCache<'getNetworkByKey'>({
        method: 'getNetworkByKey',
        getCacheKey: networkKey => networkKey,
        getValue: (eTag, networkKey) =>
            this.api.getNetworkByKey({ networkKey, eTag }),
    })

    public readonly getCurrentlyPlaying =
        this.withETagCache<'getCurrentlyPlaying'>({
            method: 'getCurrentlyPlaying',
            getCacheKey: networkKey => networkKey,
            getValue: (eTag, networkKey) =>
                this.api.getCurrentlyPlaying({ networkKey, eTag }),
        })

    public readonly getChannelFilters = this.withETagCache<'getChannelFilters'>(
        {
            method: 'getChannelFilters',
            getCacheKey: networkKey => networkKey,
            getValue: (eTag, networkKey) =>
                this.api.getChannelFilters({ networkKey, eTag }),
        },
    )

    public readonly getChannelFilter = this.withETagCache<'getChannelFilter'>({
        method: 'getChannelFilter',
        getCacheKey: channelFilterId => channelFilterId.toString(10),
        getValue: (eTag, channelFilterId) =>
            this.api.getChannelFilter({ channelFilterId, eTag }),
    })
}
