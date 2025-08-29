import { join } from 'node:path'

import { Injectable, type OnModuleInit } from '@nestjs/common'

import type { Channel, ChannelID, ChannelKey } from '#domain/channel/channel.js'
import type { IChannelRepository } from '#domain/channel/channel.repository.interface.js'
import { ChannelNotFoundError } from '#domain/channel/channel-not-found.error.js'
import type { NetworkID } from '#domain/network/network.js'

import { AbstractRepository } from '../abstract.repository.js'
import { IDatabase } from '../database.interface.js'

import { channelsViewRow } from './sql/channels.row.js'

@Injectable()
export class ChannelRepository
  extends AbstractRepository<
    ['get-one', 'get-all', 'get-all-for-network', 'get-one-by-key', 'insert', 'update']
  >
  implements IChannelRepository, OnModuleInit
{
  public constructor(database: IDatabase) {
    super(database, {
      directory: join(import.meta.dirname, 'sql'),
      fileNames: [
        'get-one',
        'get-all',
        'get-all-for-network',
        'get-one-by-key',
        'insert',
        'update',
      ],
    })
  }

  public async getByID(channelId: ChannelID): Promise<Channel> {
    const stmt = this.stmt.GET_ONE

    stmt.bind({ id: channelId })
    const rows = (await stmt.runAndReadAll()).getRowObjects()

    if (rows.length === 0) {
      throw new ChannelNotFoundError(channelId)
    }

    return channelsViewRow.parse(rows[0]).toDomain()
  }

  public async getByKeyForNetwork(networkId: NetworkID, channelKey: ChannelKey): Promise<Channel> {
    const stmt = this.stmt.GET_ONE_BY_KEY

    stmt.bind({ network_id: networkId, key: channelKey })
    const rows = (await stmt.runAndReadAll()).getRowObjects()

    if (rows.length === 0) {
      throw new ChannelNotFoundError(channelKey)
    }

    return channelsViewRow.parse(rows[0]).toDomain()
  }

  public async getAll(): Promise<Channel[]> {
    const stmt = this.stmt.GET_ALL

    const rows = (await stmt.runAndReadAll()).getRowObjects()

    return rows.map(row => channelsViewRow.parse(row).toDomain())
  }

  public async getAllForNetwork(networkId: NetworkID): Promise<Channel[]> {
    const stmt = this.stmt.GET_ALL_FOR_NETWORK
    stmt.bind({ network_id: networkId })

    const rows = (await stmt.runAndReadAll()).getRowObjects()

    return rows.map(row => channelsViewRow.parse(row).toDomain())
  }

  public async insert(channel: Channel): Promise<Channel> {
    // TODO: Handle FK violations and duplicate key errors
    const stmt = this.stmt.INSERT
    stmt.bind({
      id: channel.id,
      key: channel.key,
      name: channel.name,
      network_id: channel.networkId,
      description: channel.description,
      director: channel.director,
    })
    await stmt.run()

    return this.getByID(channel.id)
  }
}
