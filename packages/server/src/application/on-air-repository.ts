import { Injectable, type OnApplicationBootstrap } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Cron } from '@nestjs/schedule'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import pLimit from 'p-limit'

import {
    type Channel,
    type ChannelID,
    type CurrentlyPlayingTrack,
    IArtistRepository,
    IChannelRepository,
    INetworkRepository,
    type IOnAirRepository,
    ITrackRepository,
    type Network,
} from '../domain/audio-addict'
import { type OnAirTrack } from '../domain/audio-addict/on-air-track'
import { OnAirTrackChangedEvent } from '../domain/event'

import {
    type CurrentlyPlayingByChannelID,
    IAudioAddictApi,
} from './audio-addict-api.interface'
import { ICurrentTimeProvider } from './current-time-provider.interface'

@Injectable()
export class OnAirRepository
implements IOnAirRepository, OnApplicationBootstrap
{
    private readonly limit = pLimit(5)
    private readonly audioAddictApi: IAudioAddictApi
    private readonly networkRepository: INetworkRepository
    private readonly channelRepository: IChannelRepository
    private readonly trackRepository: ITrackRepository
    private readonly artistRepository: IArtistRepository
    private readonly currentlyPlaying: CurrentlyPlayingByChannelID
    private readonly eventEmitter: EventEmitter2
    private readonly currentTimeProvider: ICurrentTimeProvider
    private readonly logger: PinoLogger

    public constructor(
        networkRepository: INetworkRepository,
        channelRepository: IChannelRepository,
        trackRepository: ITrackRepository,
        artistRepository: IArtistRepository,
        audioAddictApi: IAudioAddictApi,
        currentTimeProvider: ICurrentTimeProvider,
        eventEmitter: EventEmitter2,
        @InjectPinoLogger(OnAirRepository.name) logger: PinoLogger,
    ) {
        this.networkRepository = networkRepository
        this.channelRepository = channelRepository
        this.trackRepository = trackRepository
        this.artistRepository = artistRepository
        this.audioAddictApi = audioAddictApi
        this.currentlyPlaying = new Map()
        this.currentTimeProvider = currentTimeProvider
        this.eventEmitter = eventEmitter
        this.logger = logger
    }

    public getOnAir(_channelId: ChannelID): OnAirTrack | null {
        return null
    }

    private async getCurrentlyPlayingOnNetwork(
        network: Network,
    ): Promise<CurrentlyPlayingByChannelID> {
        this.logger.trace(
            `Loading currently playing tracks for network '${network.key}'`,
        )

        const result = await this.audioAddictApi.getCurrentlyPlaying(
            network.key,
        )
        this.logger.info(
            `Loaded currently playing tracks for network '${network.key}`,
        )

        return result
    }

    private setNewNowPlaying(
        channel: Channel,
        next: CurrentlyPlayingTrack | null,
    ): void {
        const current = this.currentlyPlaying.get(channel.id)

        if (
            (current === null && next !== null) ||
            (current !== null && next === null) ||
            !current?.equals(next)
        ) {
            this.logger.warn(
                `Channel ${channel.id} changed from ${
                    current ? current.id : '<none>'
                } to ${next ? next.id : '<none>'}`,
            )
            this.currentlyPlaying.set(channel.id, next)
            this.eventEmitter.emit(
                OnAirTrackChangedEvent.name,
                new OnAirTrackChangedEvent({
                    track: next,
                    channel,
                }),
            )
        }
    }

    @Cron('0/15 * * * * *')
    public async update(): Promise<void> {
        this.logger.info('Updating currently playing tracks')
        const byNetwork = await Promise.all(
            this.networkRepository
                .getNetworks()
                .map(network =>
                    this.limit(() =>
                        this.getCurrentlyPlayingOnNetwork(network),
                    ),
                ),
        )

        for (const byChannelId of byNetwork) {
            for (const [channelId, currentlyPlaying] of byChannelId) {
                const channel = this.channelRepository.getChannel(channelId)
                this.setNewNowPlaying(channel, currentlyPlaying)
            }
        }
    }

    public async onApplicationBootstrap(): Promise<void> {
        await this.update()
    }
}
