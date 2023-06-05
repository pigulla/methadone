import { Injectable } from '@nestjs/common'
import { type Database } from 'better-sqlite3'

import {
    type NetworkID,
    type IChannelFilterRepository,
    type ChannelFilter,
    type ChannelFilterID,
    type ChannelFilterKey,
} from '../../../domain/audio-addict'
import { ChannelFilterNotFoundError } from '../../../domain/audio-addict/error'
import { IDatabaseConnection } from '../database-connection.interface'

import { rowToDomain, type RowWithChannels } from './row'
import { prepare, initialize, type Statements } from './sql'

@Injectable()
export class ChannelFilterRepository implements IChannelFilterRepository {
    private readonly db: Database
    private readonly statements: Statements

    public constructor(databaseConnection: IDatabaseConnection) {
        this.db = databaseConnection.db.exec(initialize)
        this.statements = prepare(this.db)
    }

    public insertChannelFilter(channelFilter: ChannelFilter): void {
        this.statements.insert.run(
            channelFilter.id,
            channelFilter.networkId,
            channelFilter.key,
            channelFilter.name,
            channelFilter.title,
            channelFilter.text,
            channelFilter.createdAt?.toISOString() ?? null,
            channelFilter.updatedAt?.toISOString() ?? null,
        )

        for (const channelId of channelFilter.channels) {
            this.statements.insertChannel.run(channelFilter.id, channelId)
        }
    }

    public getChannelFilters(): ChannelFilter[] {
        return this.statements.getAll
            .all()
            .map(row => rowToDomain(row as RowWithChannels))
    }

    public getChannelFilter(channelFilterId: ChannelFilterID): ChannelFilter
    public getChannelFilter(
        channelFilterKey: ChannelFilterKey,
        networkId: NetworkID,
    ): ChannelFilter
    public getChannelFilter(
        channelFilterIdentifier: ChannelFilterID | ChannelFilterKey,
        networkId?: NetworkID,
    ): ChannelFilter {
        const row = (
            typeof channelFilterIdentifier === 'number'
                ? this.statements.getOneById.get(channelFilterIdentifier)
                : this.statements.getOneByKeyAndNetworkId.get(
                    channelFilterIdentifier,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      networkId!,
                )
        ) as RowWithChannels | undefined

        if (!row) {
            throw new ChannelFilterNotFoundError(channelFilterIdentifier)
        }

        return rowToDomain(row)
    }

    public getChannelFiltersForNetwork(networkId: NetworkID): ChannelFilter[] {
        return this.statements.getAllForNetwork
            .all(networkId)
            .map(row => rowToDomain(row as RowWithChannels))
    }
}
