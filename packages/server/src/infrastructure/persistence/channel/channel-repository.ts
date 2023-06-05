import { Injectable } from '@nestjs/common'
import { type Database } from 'better-sqlite3'

import {
    type IChannelRepository,
    type Channel,
    type ChannelID,
    type ChannelKey,
    type NetworkID,
} from '../../../domain/audio-addict'
import { ChannelNotFoundError } from '../../../domain/audio-addict/error'
import { IDatabaseConnection } from '../database-connection.interface'

import { rowToDomain, type RowWithSimilar } from './row'
import { prepare, initialize, type Statements } from './sql'

@Injectable()
export class ChannelRepository implements IChannelRepository {
    private readonly db: Database
    private readonly statements: Statements

    public constructor(databaseConnection: IDatabaseConnection) {
        this.db = databaseConnection.db.exec(initialize)
        this.statements = prepare(this.db)
    }

    public insertChannel(channel: Channel): void {
        this.statements.insert.run(
            channel.id,
            channel.networkId,
            channel.key,
            channel.name,
        )

        for (const similarChannelId of channel.similarChannels) {
            this.statements.insertSimilar.run(channel.id, similarChannelId)
        }
    }

    public getChannels(): Channel[] {
        return this.statements.getAll
            .all()
            .map(row => rowToDomain(row as RowWithSimilar))
    }

    public getChannel(channelId: ChannelID): Channel
    public getChannel(channelKey: ChannelKey, networkId: NetworkID): Channel
    public getChannel(
        channelIdentifier: ChannelID | ChannelKey,
        networkId?: NetworkID,
    ): Channel {
        const row = (
            typeof channelIdentifier === 'number'
                ? this.statements.getOneById.get(channelIdentifier)
                : this.statements.getOneByKeyAndNetworkId.get(
                    channelIdentifier,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      networkId!,
                )
        ) as RowWithSimilar | undefined

        if (!row) {
            throw new ChannelNotFoundError(channelIdentifier)
        }

        return rowToDomain(row)
    }
}
