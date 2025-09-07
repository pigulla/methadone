import type { ChannelFilterKey, NetworkKey } from '@methadone/types'

import { Injectable } from '@nestjs/common'

import type { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import { IChannelFilterRepository } from '#domain/channel-filter/channel-filter.repository.interface.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { Transactional } from '#domain/transactional.js'

import type { IChannelFilterService } from './channel-filter.service.interface.js'

@Injectable()
export class ChannelFilterService implements IChannelFilterService {
  private readonly channelFilterRepository: IChannelFilterRepository
  private readonly networkRepository: INetworkRepository

  public constructor(
    channelFilterRepository: IChannelFilterRepository,
    networkRepository: INetworkRepository,
  ) {
    this.channelFilterRepository = channelFilterRepository
    this.networkRepository = networkRepository
  }

  @Transactional()
  public async get(
    networkKey: NetworkKey,
    channelFilterKey: ChannelFilterKey,
  ): Promise<ChannelFilter> {
    const network = await this.networkRepository.getByKey(networkKey)
    return this.channelFilterRepository.getByKeyForNetwork(network.id, channelFilterKey)
  }

  @Transactional()
  public getAll(): Promise<ChannelFilter[]> {
    return this.channelFilterRepository.getAll()
  }

  @Transactional()
  public async getAllForNetwork(networkKey: NetworkKey): Promise<ChannelFilter[]> {
    const network = await this.networkRepository.getByKey(networkKey)
    return this.channelFilterRepository.getAllForNetwork(network.id)
  }
}
