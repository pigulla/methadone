import { Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common'
// @ts-expect-error
import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect, sql } from 'kysely'

import type { IDatabase } from './database.interface.js'
import type { DatabaseType } from './types.js'

@Injectable()
export class Database implements IDatabase, OnModuleInit, OnApplicationShutdown {
  public readonly instance: Kysely<DatabaseType>

  private readonly logger = new Logger(Database.name)

  public constructor() {
    const dialect = new SqliteDialect({
      database: new SQLite(':memory:'),
    })

    this.instance = new Kysely<DatabaseType>({ dialect })
  }

  public async onModuleInit(): Promise<void> {
    this.logger.debug('Creating database tables')

    await this.createNetworksTable()
    await this.createChannelsTable()
    await this.createSimilarChannelsTable()
    await this.createChannelFiltersTable()
    await this.createChannelFiltersView()
    await this.createChannelsToFiltersTable()
    await this.createCurrentlyPlayingTable()
    await this.createChannelsView()
  }

  public async onApplicationShutdown(_signal?: string): Promise<void> {
    this.logger.debug('Disconnecting from database')
    await this.instance.destroy()
  }

  private createNetworksTable(): Promise<void> {
    return this.instance.schema
      .createTable('networks')
      .addColumn('id', 'integer', col => col.check(sql`id > 0`).primaryKey())
      .addColumn('key', 'text', col => col.unique().notNull())
      .addColumn('name', 'text', col => col.notNull())
      .addColumn('url', 'text', col => col.notNull())
      .addColumn('listen_url', 'text', col => col.notNull())
      .execute()
  }

  private createChannelsTable(): Promise<void> {
    return this.instance.schema
      .createTable('channels')
      .addColumn('id', 'integer', col => col.check(sql`id > 0`).primaryKey())
      .addColumn('network_id', 'integer', col => col.references('networks.id').notNull())
      .addColumn('key', 'text', col => col.notNull())
      .addColumn('name', 'text', col => col.notNull())
      .addColumn('description', 'text', col => col.notNull())
      .addColumn('director', 'text', col => col.notNull())
      .addUniqueConstraint('network_id_channel_key_unique', ['network_id', 'key'])
      .execute()
  }

  private createSimilarChannelsTable(): Promise<void> {
    return this.instance.schema
      .createTable('similar_channels')
      .addColumn('channel_id', 'integer', col => col.references('channels.id').notNull())
      .addColumn('similar_channel_id', 'integer', col =>
        col
          .references('channels.id')
          .check(sql`channel_id <> similar_channel_id`)
          .notNull()
          .modifyEnd(sql`DEFERRABLE INITIALLY DEFERRED`),
      )
      .addPrimaryKeyConstraint('similar_channels_pk', ['channel_id', 'similar_channel_id'])
      .execute()
  }

  private createChannelFiltersTable(): Promise<void> {
    return this.instance.schema
      .createTable('channel_filters')
      .addColumn('id', 'integer', col => col.check(sql`id > 0`).primaryKey())
      .addColumn('network_id', 'integer', col => col.references('networks.id').notNull())
      .addColumn('key', 'text', col => col.notNull())
      .addColumn('name', 'text', col => col.notNull())
      .addColumn('position', 'integer', col => col.check(sql`position >= 0`).notNull())
      .addUniqueConstraint('id_position_unique', ['id', 'position'])
      .addUniqueConstraint('network_id_key_unique', ['network_id', 'key'])
      .execute()
  }

  private createChannelsToFiltersTable(): Promise<void> {
    return this.instance.schema
      .createTable('channels_to_channel_filters')
      .addColumn('channel_id', 'integer', col => col.references('channels.id').notNull())
      .addColumn('channel_filter_id', 'integer', col =>
        col.references('channel_filters.id').notNull(),
      )
      .addPrimaryKeyConstraint('channels_to_channel_filters_pk', [
        'channel_id',
        'channel_filter_id',
      ])
      .execute()
  }

  private createCurrentlyPlayingTable(): Promise<void> {
    return this.instance.schema
      .createTable('currently_playing')
      .addColumn('channel_id', 'integer', col =>
        col.references('channels.id').notNull().primaryKey(),
      )
      .addColumn('artist', 'text')
      .addColumn('title', 'text')
      .addColumn('started_at', 'timestamptz')
      .addColumn('duration', 'integer', col => col.check(sql`duration >= 0`))
      .addCheckConstraint(
        'null_check',
        sql`(
                artist IS NULL
                AND title IS NULL
                AND started_at IS NULL
                AND duration IS NULL
            ) OR (
               artist IS NOT NULL
               AND title IS NOT NULL
               AND started_at IS NOT NULL
               AND duration IS NOT NULL
           )`,
      )
      .execute()
  }

  private createChannelFiltersView(): Promise<void> {
    return this.instance.schema
      .createView('view_channels')
      .as(
        this.instance
          .selectFrom('channels')
          .selectAll()
          .select(
            sql`
            COALESCE(
                (
                    SELECT JSON_GROUP_ARRAY(similar_channels.similar_channel_id)
                    FROM similar_channels
                    WHERE similar_channels.channel_id = channels.id
                ),
                '[]'
            )`.as('similar_channels'),
          ),
      )
      .execute()
  }

  private createChannelsView(): Promise<void> {
    return this.instance.schema
      .createView('view_channel_filters')
      .as(
        this.instance
          .selectFrom('channel_filters')
          .selectAll()
          .select(
            sql`
            COALESCE(
                (
                    SELECT JSON_GROUP_ARRAY(channels.id)
                    FROM channels_to_channel_filters
                    JOIN channels ON channels.id = channels_to_channel_filters.channel_id
                    WHERE channels_to_channel_filters.channel_filter_id = channel_filters.id
                ),
                '[]'
            )`.as('channel_ids'),
          ),
      )
      .execute()
  }
}
