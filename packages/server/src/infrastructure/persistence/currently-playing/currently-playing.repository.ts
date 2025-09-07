import { Injectable } from '@nestjs/common'

import type { ChannelID } from '#domain/channel/channel.js'
import { ChannelNotFoundError } from '#domain/channel/channel-not-found.error.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import type { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import type { NetworkID } from '#domain/network/network.js'
import { NetworkNotFoundError } from '#domain/network/network-not-found.error.js'

import { AbstractRepository } from '../abstract.repository.js'

import { currentlyPlayingRow } from './currently-playing.row.js'

@Injectable()
export class CurrentlyPlayingRepository
  extends AbstractRepository
  implements ICurrentlyPlayingRepository
{
  public async deleteAll(): Promise<void> {
    await this.txHost.tx.deleteFrom('currently_playing').execute()
  }

  public async get(channelId: ChannelID): Promise<CurrentlyPlaying | null> {
    const row = await this.txHost.tx
      .selectFrom('currently_playing')
      .where('channel_id', '=', channelId)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new ChannelNotFoundError(channelId)
    }

    return currentlyPlayingRow.parse(row).toDomain()
  }

  public async getForNetwork(
    networkId: NetworkID,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    const rows = await this.txHost.tx
      .selectFrom('currently_playing')
      .leftJoin('channels', join =>
        join
          .onRef('channels.id', '=', 'currently_playing.channel_id')
          .on('channels.network_id', '=', networkId),
      )
      .selectAll()
      .execute()

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
    const rows = await this.txHost.tx.selectFrom('currently_playing').selectAll().execute()

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
    await this.txHost.tx
      .insertInto('currently_playing')
      .values({
        channel_id: channelId,
        artist: currentlyPlaying?.artist ?? null,
        title: currentlyPlaying?.title ?? null,
        started_at: currentlyPlaying?.startedAt.toISOString() ?? null,
        duration: currentlyPlaying?.duration.asSeconds() ?? null,
      })
      .onConflict(oc =>
        oc.column('channel_id').doUpdateSet({
          artist: eb => eb.ref('excluded.artist'),
          title: eb => eb.ref('excluded.title'),
          started_at: eb => eb.ref('excluded.started_at'),
          duration: eb => eb.ref('excluded.duration'),
        }),
      )
      .execute()
  }
}
