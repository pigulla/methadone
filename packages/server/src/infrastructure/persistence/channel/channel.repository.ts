import { join } from 'node:path'

import type { ChannelID, ChannelKey, NetworkID } from '@digitally-exported/types'

import { Injectable, type OnModuleInit } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'

import type { Channel } from '#domain/channel/channel.js'
import type { IChannelRepository } from '#domain/channel/channel.repository.interface.js'
import { ChannelNotFoundError } from '#domain/channel/channel-not-found.error.js'

import { AbstractRepository } from '../abstract.repository.js'
import { TransactionalAdapterPglite } from '../transactional-adapter-pglite.js'

import { channelsViewRow } from './channels.row.js'

@Injectable()
export class ChannelRepository
  extends AbstractRepository<
    [
      'get-one',
      'get-all',
      'get-all-for-network',
      'get-one-by-key',
      'insert',
      'insert-similar-channel',
    ]
  >
  implements IChannelRepository, OnModuleInit
{
  public constructor(txHost: TransactionHost<TransactionalAdapterPglite>) {
    super(txHost, {
      directory: join(import.meta.dirname, 'sql'),
      fileNames: [
        'get-one',
        'get-all',
        'get-all-for-network',
        'get-one-by-key',
        'insert',
        'insert-similar-channel',
      ],
    })
  }

  public async getByID(channelId: ChannelID): Promise<Channel> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ONE, [channelId])

    if (rows.length === 0) {
      throw new ChannelNotFoundError(channelId)
    }

    return channelsViewRow.parse(rows[0]).toDomain()
  }

  public async getByKeyForNetwork(networkId: NetworkID, channelKey: ChannelKey): Promise<Channel> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ONE_BY_KEY, [
      networkId,
      channelKey,
    ])

    if (rows.length === 0) {
      throw new ChannelNotFoundError(channelKey)
    }

    return channelsViewRow.parse(rows[0]).toDomain()
  }

  public async getAll(): Promise<Channel[]> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ALL, [])

    return rows.map(row => channelsViewRow.parse(row).toDomain())
  }

  public async getAllForNetwork(networkId: NetworkID): Promise<Channel[]> {
    const { rows } = await this.txHost.tx.query<unknown>(this.stmt.GET_ALL_FOR_NETWORK, [networkId])

    return rows.map(row => channelsViewRow.parse(row).toDomain())
  }

  public async insert(channel: Channel): Promise<Channel> {
    await this.txHost.tx.query<unknown>(this.stmt.INSERT, [
      channel.id,
      channel.key,
      channel.networkId,
      channel.name,
      channel.description,
      channel.director,
    ])

    await this.setSimilar(channel)

    return this.getByID(channel.id)
  }

  private async setSimilar(channel: Channel): Promise<void> {
    for (const similarChannelID of channel.similar) {
      await this.txHost.tx.query<unknown>(this.stmt.INSERT_SIMILAR_CHANNEL, [
        channel.id,
        similarChannelID,
      ])
    }
  }
}
