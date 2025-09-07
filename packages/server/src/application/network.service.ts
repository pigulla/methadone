import { Injectable } from '@nestjs/common'

import { Network, type NetworkKey } from '#domain/network/network.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { Transactional } from '#domain/transactional.js'

import type { INetworkService } from './network.service.interface.js'

@Injectable()
export class NetworkService implements INetworkService {
  private readonly repository: INetworkRepository

  public constructor(repository: INetworkRepository) {
    this.repository = repository
  }

  @Transactional()
  public get(key: NetworkKey): Promise<Network> {
    return this.repository.getByKey(key)
  }

  @Transactional()
  public getAll(): Promise<Network[]> {
    return this.repository.getAll()
  }
}
