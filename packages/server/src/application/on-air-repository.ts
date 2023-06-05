import { Injectable, type OnApplicationBootstrap } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Cron } from '@nestjs/schedule'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import {
    type ChannelID,
    type CurrentlyPlayingTrack,
    IArtistRepository,
    IChannelRepository,
    INetworkRepository,
    type IOnAirRepository,
    ITrackRepository,
} from '../domain/audio-addict'
import { type OnAirTrack } from '../domain/audio-addict/on-air-track'
import { type OnAirTrackChangedEvent } from '../domain/event'

import { IAudioAddictApi } from './audio-addict-api.interface'
import { ICurrentTimeProvider } from './current-time-provider.interface'

@Injectable()
export class OnAirRepository
implements IOnAirRepository, OnApplicationBootstrap
{
    private readonly audioAddictApi: IAudioAddictApi
    private readonly networkRepository: INetworkRepository
    private readonly channelRepository: IChannelRepository
    private readonly trackRepository: ITrackRepository
    private readonly artistRepository: IArtistRepository
    private readonly currentlyPlaying: Map<
        ChannelID,
        CurrentlyPlayingTrack | null
    >
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

    @Cron('0/15 * * * * *')
    public async update(): Promise<void> {
        this.logger.info('Updating')

        const result = await Promise.all(
            this.networkRepository
                .getNetworks()
                .map(network =>
                    this.audioAddictApi.getCurrentlyPlaying(network.key),
                ),
        )

        for (const nowPlaying of result) {
            for (const [channelId, currentTrack] of nowPlaying.entries()) {
                const previousTrack = this.currentlyPlaying.get(channelId)
                const channel = this.channelRepository.getChannel(channelId)

                if (
                    (previousTrack === null && currentTrack === null) ||
                    previousTrack?.equals(currentTrack)
                ) {
                    continue
                }

                if (currentTrack) {
                    const track = this.trackRepository.findTrack(
                        currentTrack.id,
                    )

                    if (!track) {
                        const x = await this.audioAddictApi.getTrack(
                            currentTrack.id,
                        )

                        const artist = this.artistRepository.findArtist(
                            x.artistId,
                        )

                        if (!artist) {
                            const a = await this.audioAddictApi.getArtist(
                                x.artistId,
                            )
                            this.artistRepository.insertArtist(a)
                        }

                        this.trackRepository.insertTrack(x)
                    }
                }

                this.currentlyPlaying.set(channel.id, currentTrack)
            }
        }
    }

    public async onApplicationBootstrap(): Promise<void> {
        await this.update()
    }
}
