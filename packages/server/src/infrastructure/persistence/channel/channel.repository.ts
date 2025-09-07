import { Injectable } from '@nestjs/common'

import type { Channel, ChannelID, ChannelKey } from '#domain/channel/channel.js'
import type { IChannelRepository } from '#domain/channel/channel.repository.interface.js'
import { ChannelNotFoundError } from '#domain/channel/channel-not-found.error.js'
import type { NetworkID } from '#domain/network/network.js'

import { AbstractRepository } from '../abstract.repository.js'

import { channelsViewRow } from './channels.row.js'

@Injectable()
export class ChannelRepository extends AbstractRepository implements IChannelRepository {
  public async getByID(channelId: ChannelID): Promise<Channel> {
    const row = await this.txHost.tx
      .selectFrom('view_channels')
      .where('id', '=', channelId)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new ChannelNotFoundError(channelId)
    }

    return channelsViewRow.parse(row).toDomain()
  }

  public async getByKeyForNetwork(networkId: NetworkID, channelKey: ChannelKey): Promise<Channel> {
    const row = await this.txHost.tx
      .selectFrom('view_channels')
      .where('network_id', '=', networkId)
      .where('key', '=', channelKey)
      .selectAll()
      .executeTakeFirst()

    if (!row) {
      throw new ChannelNotFoundError(channelKey)
    }

    return channelsViewRow.parse(row).toDomain()
  }

  public async getAll(): Promise<Channel[]> {
    const rows = await this.txHost.tx.selectFrom('view_channels').selectAll().execute()

    return rows.map(row => channelsViewRow.parse(row).toDomain())
  }

  public async getAllForNetwork(networkId: NetworkID): Promise<Channel[]> {
    const rows = await this.txHost.tx
      .selectFrom('view_channels')
      .where('network_id', '=', networkId)
      .selectAll()
      .execute()

    return rows.map(row => channelsViewRow.parse(row).toDomain())
  }

  public async insert(channel: Channel): Promise<Channel> {
    await this.txHost.tx
      .insertInto('channels')
      .values({
        id: channel.id,
        key: channel.key,
        network_id: channel.networkId,
        name: channel.name,
        description: channel.description,
        director: channel.director,
      })
      .execute()

    await this.setSimilar(channel)

    return this.getByID(channel.id)
  }

  private async setSimilar(channel: Channel): Promise<void> {
    for (const similarChannelID of channel.similar) {
      await this.txHost.tx
        .insertInto('similar_channels')
        .values({
          channel_id: channel.id,
          similar_channel_id: similarChannelID,
        })
        .execute()
    }
  }
}
