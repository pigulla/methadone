import { Injectable } from '@nestjs/common'

import type { Network, NetworkID, NetworkKey } from '#domain/network/network.js'
import type { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { NetworkNotFoundError } from '#domain/network/network-not-found.error.js'

import { AbstractRepository } from '../abstract.repository.js'

import { networksRow } from './networks.row.js'

@Injectable()
export class NetworkRepository extends AbstractRepository implements INetworkRepository {
  public async getByID(networkId: NetworkID): Promise<Network> {
    const row = await this.txHost.tx
      .selectFrom('networks')
      .where('id', '=', networkId)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new NetworkNotFoundError(networkId)
    }

    return networksRow.parse(row).toDomain()
  }

  public async getByKey(networkKey: NetworkKey): Promise<Network> {
    const row = await this.txHost.tx
      .selectFrom('networks')
      .where('key', '=', networkKey)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new NetworkNotFoundError(networkKey)
    }

    return networksRow.parse(row).toDomain()
  }

  public async getAll(): Promise<Network[]> {
    const rows = await this.txHost.tx.selectFrom('networks').selectAll().execute()

    return rows.map(row => networksRow.parse(row).toDomain())
  }

  public async insert(network: Network): Promise<Network> {
    const row = await this.txHost.tx
      .insertInto('networks')
      .values({
        id: network.id,
        key: network.key,
        name: network.name,
        url: network.url,
        listen_url: network.listenUrl,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return networksRow.parse(row).toDomain()
  }
}
