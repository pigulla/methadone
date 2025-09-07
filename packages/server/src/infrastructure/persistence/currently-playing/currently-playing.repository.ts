import { join } from 'node:path'

import type { ChannelID, NetworkID } from '@methadone/types'

import { Injectable, type OnModuleInit } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'

import { ChannelNotFoundError } from '#domain/channel/channel-not-found.error.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import type { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import { NetworkNotFoundError } from '#domain/network/network-not-found.error.js'

import { AbstractRepository } from '../abstract.repository.js'
import { TransactionalAdapterPglite } from '../transactional-adapter-pglite.js'

import { currentlyPlayingRow } from './currently-playing.row.js'

@Injectable()
export class CurrentlyPlayingRepository
  extends AbstractRepository<['delete-all', 'get-one', 'get-all', 'get-all-for-network', 'upsert']>
  implements ICurrentlyPlayingRepository, OnModuleInit
{
  public constructor(txHost: TransactionHost<TransactionalAdapterPglite>) {
    super(txHost, {
      directory: join(import.meta.dirname, 'sql'),
      fileNames: ['delete-all', 'get-one', 'get-all', 'get-all-for-network', 'upsert'],
    })
  }

  public async deleteAll(): Promise<void> {
    await this.txHost.tx.query(this.stmt.DELETE_ALL)
  }

  public async get(channelId: ChannelID): Promise<CurrentlyPlaying | null> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ONE, [channelId])

    if (rows.length === 0) {
      throw new ChannelNotFoundError(channelId)
    }

    return currentlyPlayingRow.parse(rows[0]).toDomain()
  }

  public async getForNetwork(
    networkId: NetworkID,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ONE, [networkId])

    if (rows.length === 0) {
      // Theoretically there could of course be networks with no channels, but in practice that's not going to happen.
      throw new NetworkNotFoundError(networkId)
    }

    return new Map(
      rows
        .map(row => currentlyPlayingRow.parse(row))
        .map(value => [value.channel_id, value.toDomain()] as const),
    )
  }

  public async getAll(): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ALL, [])

    return new Map(
      rows
        .map(row => currentlyPlayingRow.parse(row))
        .map(value => [value.channel_id, value.toDomain()] as const),
    )
  }

  public async upsert(
    channelId: ChannelID,
    currentlyPlaying: CurrentlyPlaying | null,
  ): Promise<void> {
    await this.txHost.tx.query<unknown>(this.stmt.UPSERT, [
      channelId,
      currentlyPlaying ? currentlyPlaying.artist : null,
      currentlyPlaying ? currentlyPlaying.title : null,
      currentlyPlaying ? currentlyPlaying.startedAt.toISOString() : null,
      currentlyPlaying ? currentlyPlaying.duration.asSeconds() : null,
    ])
  }
}
