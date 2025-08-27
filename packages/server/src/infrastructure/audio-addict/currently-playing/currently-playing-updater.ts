import { clearInterval, setInterval } from 'node:timers'

import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common'
import type { Duration } from 'dayjs/plugin/duration.js'

import { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'
import {
  AUDIO_ADDICT_CONFIG,
  type AudioAddictConfig,
} from '#infrastructure/config/audio-addict.config.js'

import { IAudioAddictAPI } from '../api/audio-addict-api.interface.js'

import type { ICurrentlyPlayingUpdater } from './currently-playing-updater.interface.js'

@Injectable()
export class CurrentlyPlayingUpdater
  implements ICurrentlyPlayingUpdater, OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(CurrentlyPlayingUpdater.name)
  private readonly intervalDuration: Duration
  private readonly api: IAudioAddictAPI
  private readonly networkRepository: INetworkRepository
  private readonly nowPlayingRepository: ICurrentlyPlayingRepository
  private intervalId: NodeJS.Timeout | null

  public constructor(
    @Inject(AUDIO_ADDICT_CONFIG) config: AudioAddictConfig,
    api: IAudioAddictAPI,
    networkRepository: INetworkRepository,
    repository: ICurrentlyPlayingRepository,
  ) {
    this.intervalDuration = config.currentlyPlayingRefreshInterval
    this.api = api
    this.networkRepository = networkRepository
    this.nowPlayingRepository = repository
    this.intervalId = null
  }

  public async onApplicationBootstrap(): Promise<void> {
    await this.update()

    if (this.intervalId === null) {
      this.intervalId = setInterval(() => this.update(), this.intervalDuration.asMilliseconds())
    }
  }

  public onApplicationShutdown(_signal?: string): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  public async update(): Promise<void> {
    this.logger.verbose('Updating "currently playing" data')
    const networks = await this.networkRepository.getAll()
    const nowPlaying = (
      await Promise.all(networks.map(network => this.api.getCurrentlyPlaying(network.id)))
    )
      .flat()
      .filter(value => value.fromCache)

    await this.nowPlayingRepository.deleteAll()
    for (const item of nowPlaying) {
      await this.nowPlayingRepository.upsert(item)
    }
    this.logger.log(
      `Successfully updated "currently playing" data for ${nowPlaying.length} channel(s)`,
    )
  }
}
