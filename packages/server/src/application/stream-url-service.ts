import { URL } from 'node:url'

import { Injectable } from '@nestjs/common'

import {
    type Channel,
    type ChannelKey,
    IChannelRepository,
    INetworkRepository,
    ListenKey,
    type NetworkKey,
    Quality,
} from '../domain/audio-addict'

import { IAudioAddictApi } from './audio-addict-api.interface'
import { type IStreamUrlService } from './stream-url-service.interface'

@Injectable()
export class StreamUrlService implements IStreamUrlService {
    private static readonly QUALITY_SUFFIXES: Readonly<
        Record<Quality, string>
    > = {
            [Quality.AAC_128]: '',
            [Quality.AAC_64]: '_aac',
            [Quality.MP3_320]: '_hi',
        }

    private readonly listenKey: ListenKey
    private readonly api: IAudioAddictApi
    private readonly networkRepository: INetworkRepository
    private readonly channelRepository: IChannelRepository

    public constructor(
        listenKey: ListenKey,
        audioAddictApi: IAudioAddictApi,
        networkRepository: INetworkRepository,
        channelRepository: IChannelRepository,
    ) {
        this.listenKey = listenKey
        this.api = audioAddictApi
        this.networkRepository = networkRepository
        this.channelRepository = channelRepository
    }

    public getChannelFromStreamUrl(streamUrl: string): Channel {
        const url = new URL(streamUrl)
        const networkKey = url.host.split('.').slice(-2, -1)[0] as NetworkKey
        const matches = /^\/([_a-z0-9]+?)(?:_[a-z]+)?$/.exec(url.pathname)

        if (!matches) {
            throw new Error(`Failed to infer channel from stream URL`)
        }

        const network = this.networkRepository.getNetwork(networkKey)
        const channelKey = matches[1] as ChannelKey
        return this.channelRepository.getChannel(channelKey, network.id)
    }

    public async getStreamUrl(
        channel: Channel,
        quality: Quality,
    ): Promise<string> {
        const network = this.networkRepository.getNetwork(channel.networkId)
        const urls = await this.api.getStreamUrls({
            networkKey: network.key,
            channelKey: channel.key,
            quality,
        })

        if (urls.size === 0) {
            throw new Error('No stream URL found')
        }

        const url = [...urls][0]

        return `${url}?${encodeURIComponent(this.listenKey)}`
    }
}
