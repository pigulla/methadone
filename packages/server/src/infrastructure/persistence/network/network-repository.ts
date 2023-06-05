import { Injectable } from '@nestjs/common'
import { type Database } from 'better-sqlite3'

import {
    type INetworkRepository,
    type Network,
    type NetworkID,
    type NetworkKey,
} from '../../../domain/audio-addict'
import { NetworkNotFoundError } from '../../../domain/audio-addict/error'
import { IDatabaseConnection } from '../database-connection.interface'

import { type Row, rowToDomain } from './row'
import { prepare, initialize, type Statements } from './sql'

@Injectable()
export class NetworkRepository implements INetworkRepository {
    private readonly db: Database
    private readonly statements: Statements

    public constructor(databaseConnection: IDatabaseConnection) {
        this.db = databaseConnection.db.exec(initialize)
        this.statements = prepare(this.db)
    }

    public insertNetwork(network: Network): void {
        this.statements.insert.run(
            network.id,
            network.key,
            network.name,
            network.url,
        )
    }

    public getNetworks(): Network[] {
        return this.statements.getAll.all().map(row => rowToDomain(row as Row))
    }

    public getNetwork(networkId: NetworkID): Network
    public getNetwork(networkKey: NetworkKey): Network
    public getNetwork(identifier: NetworkID | NetworkKey): Network {
        const row = (
            typeof identifier === 'number'
                ? this.statements.getOneById.get(identifier)
                : this.statements.getOneByKey.get(identifier)
        ) as Row | undefined

        if (!row) {
            throw new NetworkNotFoundError(identifier)
        }

        return rowToDomain(row)
    }
}
