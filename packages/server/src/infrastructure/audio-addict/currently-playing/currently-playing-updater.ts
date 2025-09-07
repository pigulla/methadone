import { clearInterval, setInterval } from 'node:timers'

import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'

import type { ChannelID } from '#domain/channel/channel.js'
import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'

import { AUDIO_ADDICT_CONFIG, type AudioAddictConfig } from '../../config/audio-addict.config.js'
import { IAudioAddictAPI } from '../api/audio-addict-api.interface.js'

import type { ICurrentlyPlayingUpdater } from './currently-playing-updater.interface.js'

@Injectable()
export class CurrentlyPlayingUpdater
  implements ICurrentlyPlayingUpdater, OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(CurrentlyPlayingUpdater.name)
  private readonly config: AudioAddictConfig
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
    this.config = config
    this.api = api
    this.networkRepository = networkRepository
    this.nowPlayingRepository = repository
    this.intervalId = null
  }

  public async onApplicationBootstrap(): Promise<void> {
    await this.update()

    if (this.intervalId === null) {
      this.intervalId = setInterval(
        () => this.update(),
        this.config.currentlyPlayingRefreshInterval.asMilliseconds(),
      )
    }
  }

  public onModuleDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  // FIXME: The transaction occasionally hangs :-/
  @Transactional()
  public async update(): Promise<void> {
    this.logger.verbose('Updating "currently playing" data')

    const networks = await this.networkRepository.getAll()
    const data: Map<ChannelID, CurrentlyPlaying | null>[] = []

    for (const network of networks) {
      this.logger.warn(network.name)
      data.push(await this.api.getCurrentlyPlaying(network.key))
    }

    const currentlyPlaying = data.flatMap(item => [...item.entries()])

    this.logger.warn('Deleting')
    await this.nowPlayingRepository.deleteAll()

    for (const [channelId, item] of currentlyPlaying) {
      this.logger.warn(`Upserting ${channelId}`)
      await this.nowPlayingRepository.upsert(channelId, item)
    }

    this.logger.log(
      `Successfully updated "currently playing" data for ${currentlyPlaying.length} channel(s)`,
    )
  }
}
