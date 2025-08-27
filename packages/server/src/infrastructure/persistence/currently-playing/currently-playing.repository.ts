import { join } from 'node:path'

import { intervalValue, timestampTZValue } from '@duckdb/node-api'
import { Injectable, type OnModuleInit } from '@nestjs/common'

import type { ChannelID } from '#domain/channel/channel.js'
import { ChannelNotFoundError } from '#domain/channel/channel-not-found.error.js'
import type { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import type { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import type { NetworkID } from '#domain/network/network.js'
import { NetworkNotFoundError } from '#domain/network/network-not-found.error.js'

import { AbstractRepository } from '../abstract.repository.js'
import { IDatabase } from '../database.interface.js'

import { currentlyPlayingRow } from './sql/currently-playing.row.js'

@Injectable()
export class CurrentlyPlayingRepository
  extends AbstractRepository<['delete-all', 'get-one', 'get-all', 'get-all-for-network', 'upsert']>
  implements ICurrentlyPlayingRepository, OnModuleInit
{
  public constructor(database: IDatabase) {
    super(database, {
      directory: join(import.meta.dirname, 'sql'),
      fileNames: ['delete-all', 'get-one', 'get-all', 'get-all-for-network', 'upsert'],
    })
  }

  public async deleteAll(): Promise<void> {
    await this.stmt.DELETE_ALL.run()
  }

  public async get(id: ChannelID): Promise<CurrentlyPlaying> {
    const stmt = this.stmt.GET_ONE

    stmt.bind({ channel_id: id })
    const rows = (await stmt.runAndReadAll()).getRowObjects()

    if (rows.length === 0) {
      throw new ChannelNotFoundError(id)
    }

    return currentlyPlayingRow.parse(rows[0]).toDomain()
  }

  public async getForNetwork(id: NetworkID): Promise<Map<ChannelID, CurrentlyPlaying>> {
    const stmt = this.stmt.GET_ALL_FOR_NETWORK

    stmt.bind({ network_id: id })
    const rows = (await stmt.runAndReadAll()).getRowObjects()

    if (rows.length === 0) {
      // Theoretically there could of course be networks with no channels, but in practice that's not going to happen.
      throw new NetworkNotFoundError(id)
    }

    return new Map(
      rows
        .map(row => currentlyPlayingRow.parse(row).toDomain())
        .map(value => [value.channelId, value] as const),
    )
  }

  public async getAll(): Promise<Map<ChannelID, CurrentlyPlaying>> {
    const stmt = this.stmt.GET_ALL

    const rows = (await stmt.runAndReadAll()).getRowObjects()

    return new Map(
      rows
        .map(row => currentlyPlayingRow.parse(row).toDomain())
        .map(value => [value.channelId, value] as const),
    )
  }

  public async upsert(nowPlaying: CurrentlyPlaying): Promise<void> {
    const stmt = this.stmt.UPSERT

    stmt.bind({
      channel_id: nowPlaying.channelId,
      artist: nowPlaying.artist,
      title: nowPlaying.title,
      started_at: timestampTZValue({
        date: {
          year: nowPlaying.startedAt.year(),
          month: nowPlaying.startedAt.month(),
          day: nowPlaying.startedAt.day(),
        },
        time: {
          hour: nowPlaying.startedAt.hour(),
          min: nowPlaying.startedAt.minute(),
          sec: nowPlaying.startedAt.second(),
          micros: 0,
        },
      }),
      duration: intervalValue(
        0,
        0,
        BigInt(nowPlaying.duration.asMilliseconds().toFixed(0)) * 1000n,
      ),
    })

    await stmt.run()
  }
}
