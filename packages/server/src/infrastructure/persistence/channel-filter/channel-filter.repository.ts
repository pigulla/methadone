import { join } from 'node:path'

import { Injectable, type OnModuleInit } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'

import type {
  ChannelFilter,
  ChannelFilterID,
  ChannelFilterKey,
} from '#domain/channel-filter/channel-filter.js'
import type { IChannelFilterRepository } from '#domain/channel-filter/channel-filter.repository.interface.js'
import { ChannelFilterNotFoundError } from '#domain/channel-filter/channel-filter-not-found.error.js'
import type { NetworkID } from '#domain/network/network.js'
import { TransactionalAdapterPglite } from '#infrastructure/persistence/transactional-adapter-pglite.js'

import { AbstractRepository } from '../abstract.repository.js'

import { channelFiltersRow } from './sql/channel-filters.row.js'

@Injectable()
export class ChannelFilterRepository
  extends AbstractRepository<
    ['get-one', 'get-one-by-key', 'get-all', 'get-all-for-network', 'insert', 'assign-channel']
  >
  implements IChannelFilterRepository, OnModuleInit
{
  public constructor(txHost: TransactionHost<TransactionalAdapterPglite>) {
    super(txHost, {
      directory: join(import.meta.dirname, 'sql'),
      fileNames: [
        'get-one',
        'get-one-by-key',
        'get-all',
        'get-all-for-network',
        'insert',
        'assign-channel',
      ],
    })
  }

  public async getByID(channelFilterId: ChannelFilterID): Promise<ChannelFilter> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ONE, [channelFilterId])

    if (rows.length === 0) {
      throw new ChannelFilterNotFoundError(channelFilterId)
    }

    return channelFiltersRow.parse(rows[0]).toDomain()
  }

  public async getByKeyForNetwork(
    networkId: NetworkID,
    channelFilterKey: ChannelFilterKey,
  ): Promise<ChannelFilter> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ONE_BY_KEY, [
      networkId,
      channelFilterKey,
    ])

    if (rows.length === 0) {
      throw new ChannelFilterNotFoundError(channelFilterKey)
    }

    return channelFiltersRow.parse(rows[0]).toDomain()
  }

  public async getAll(): Promise<ChannelFilter[]> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ALL, [])

    return rows.map(row => channelFiltersRow.parse(row).toDomain())
  }

  public async getAllForNetwork(networkId: NetworkID): Promise<ChannelFilter[]> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ALL_FOR_NETWORK, [networkId])

    return rows.map(row => channelFiltersRow.parse(row).toDomain())
  }

  // TODO: This should happen transactionally.
  public async insert(channelFilter: ChannelFilter): Promise<ChannelFilter> {
    await this.txHost.tx.query<unknown>(this.stmt.INSERT, [
      channelFilter.id,
      channelFilter.key,
      channelFilter.networkId,
      channelFilter.name,
      channelFilter.position,
    ])

    for (const channelId of channelFilter.channels) {
      await this.txHost.tx.query<unknown>(this.stmt.ASSIGN_CHANNEL, [channelId, channelFilter.id])
    }

    return this.getByID(channelFilter.id)
  }
}
