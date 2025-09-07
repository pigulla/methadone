import { Injectable } from '@nestjs/common'

import { Channel, type ChannelID, type ChannelKey } from '#domain/channel/channel.js'
import { IChannelRepository } from '#domain/channel/channel.repository.interface.js'
import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import type { NetworkKey } from '#domain/network/network.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { Transactional } from '#domain/transactional.js'

import type { IChannelService } from './channel.service.interface.js'

@Injectable()
export class ChannelService implements IChannelService {
  private readonly currentlyPlayingRepository: ICurrentlyPlayingRepository
  private readonly channelRepository: IChannelRepository
  private readonly networkRepository: INetworkRepository

  public constructor(
    currentlyPlayingRepository: ICurrentlyPlayingRepository,
    channelRepository: IChannelRepository,
    networkRepository: INetworkRepository,
  ) {
    this.currentlyPlayingRepository = currentlyPlayingRepository
    this.channelRepository = channelRepository
    this.networkRepository = networkRepository
  }

  @Transactional()
  public async getCurrentlyPlayingOnChannel(
    networkKey: NetworkKey,
    channelKey: ChannelKey,
  ): Promise<CurrentlyPlaying | null> {
    const network = await this.networkRepository.getByKey(networkKey)
    const channel = await this.channelRepository.getByKeyForNetwork(network.id, channelKey)

    return this.currentlyPlayingRepository.get(channel.id)
  }

  @Transactional()
  public async getCurrentlyPlayingOnNetwork(
    networkKey: NetworkKey,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    const network = await this.networkRepository.getByKey(networkKey)

    return this.currentlyPlayingRepository.getForNetwork(network.id)
  }

  @Transactional()
  public async get(networkKey: NetworkKey, channelKey: ChannelKey): Promise<Channel> {
    const network = await this.networkRepository.getByKey(networkKey)

    return this.channelRepository.getByKeyForNetwork(network.id, channelKey)
  }

  @Transactional()
  public async getAllForNetwork(networkKey: NetworkKey): Promise<Channel[]> {
    const network = await this.networkRepository.getByKey(networkKey)

    return this.channelRepository.getAllForNetwork(network.id)
  }
}
