import { join } from 'node:path'

import { Injectable, type OnModuleInit } from '@nestjs/common'

import type { Network, NetworkID, NetworkKey } from '#domain/network/network.js'
import type { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { NetworkNotFoundError } from '#domain/network/network-not-found.error.js'

import { AbstractRepository } from '../abstract.repository.js'
import { IDatabase } from '../database.interface.js'

import { networksRow } from './sql/networks.row.js'

@Injectable()
export class NetworkRepository
  extends AbstractRepository<['get-one', 'get-one-by-key', 'get-all', 'insert']>
  implements INetworkRepository, OnModuleInit
{
  public constructor(database: IDatabase) {
    super(database, {
      directory: join(import.meta.dirname, 'sql'),
      fileNames: ['get-one', 'get-one-by-key', 'get-all', 'insert'],
    })
  }

  public async getByID(networkId: NetworkID): Promise<Network> {
    const { rows } = await this.database.instance.query<unknown>(this.stmt.GET_ONE, [networkId])

    if (rows.length === 0) {
      throw new NetworkNotFoundError(networkId)
    }

    return networksRow.parse(rows[0]).toDomain()
  }

  public async getByKey(channelKey: NetworkKey): Promise<Network> {
    const { rows } = await this.database.instance.query<unknown>(this.stmt.GET_ONE_BY_KEY, [
      channelKey,
    ])

    if (rows.length === 0) {
      throw new NetworkNotFoundError(channelKey)
    }

    return networksRow.parse(rows[0]).toDomain()
  }

  public async getAll(): Promise<Network[]> {
    const { rows } = await this.database.instance.query<unknown>(this.stmt.GET_ALL, [])

    return rows.map(row => networksRow.parse(row).toDomain())
  }

  public async insert(network: Network): Promise<Network> {
    const { rows } = await this.database.instance.query<unknown>(this.stmt.INSERT, [
      network.id,
      network.key,
      network.name,
      network.url,
      network.listenUrl,
    ])

    return networksRow.parse(rows[0]).toDomain()
  }
}
