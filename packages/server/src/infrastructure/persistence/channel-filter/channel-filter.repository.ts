import { Injectable } from '@nestjs/common'

import type {
  ChannelFilter,
  ChannelFilterID,
  ChannelFilterKey,
} from '#domain/channel-filter/channel-filter.js'
import type { IChannelFilterRepository } from '#domain/channel-filter/channel-filter.repository.interface.js'
import { ChannelFilterNotFoundError } from '#domain/channel-filter/channel-filter-not-found.error.js'
import type { NetworkID } from '#domain/network/network.js'

import { AbstractRepository } from '../abstract.repository.js'

import { channelFiltersRow } from './channel-filters.row.js'

@Injectable()
export class ChannelFilterRepository
  extends AbstractRepository
  implements IChannelFilterRepository
{
  public async getByID(channelFilterId: ChannelFilterID): Promise<ChannelFilter> {
    const row = await this.txHost.tx
      .selectFrom('view_channel_filters')
      .where('id', '=', channelFilterId)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new ChannelFilterNotFoundError(channelFilterId)
    }

    return channelFiltersRow.parse(row).toDomain()
  }

  public async getByKeyForNetwork(
    networkId: NetworkID,
    channelFilterKey: ChannelFilterKey,
  ): Promise<ChannelFilter> {
    const row = await this.txHost.tx
      .selectFrom('view_channel_filters')
      .where('network_id', '=', networkId)
      .where('key', '=', channelFilterKey)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new ChannelFilterNotFoundError(channelFilterKey)
    }

    return channelFiltersRow.parse(row).toDomain()
  }

  public async getAll(): Promise<ChannelFilter[]> {
    const rows = await this.txHost.tx.selectFrom('view_channel_filters').selectAll().execute()

    return rows.map(row => channelFiltersRow.parse(row).toDomain())
  }

  public async getAllForNetwork(networkId: NetworkID): Promise<ChannelFilter[]> {
    const rows = await this.txHost.tx
      .selectFrom('view_channel_filters')
      .where('network_id', '=', networkId)
      .selectAll()
      .execute()

    return rows.map(row => channelFiltersRow.parse(row).toDomain())
  }

  public async insert(channelFilter: ChannelFilter): Promise<ChannelFilter> {
    await this.txHost.tx
      .insertInto('channel_filters')
      .values({
        id: channelFilter.id,
        key: channelFilter.key,
        network_id: channelFilter.networkId,
        name: channelFilter.name,
        position: channelFilter.position,
      })
      .execute()

    for (const channelId of channelFilter.channels) {
      await this.txHost.tx
        .insertInto('channels_to_channel_filters')
        .values({
          channel_id: channelId,
          channel_filter_id: channelFilter.id,
        })
        .execute()
    }

    return this.getByID(channelFilter.id)
  }
}
