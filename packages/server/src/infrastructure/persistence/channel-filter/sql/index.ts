import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Database, Statement } from 'better-sqlite3'

import {
    type ChannelFilterID,
    type ChannelFilterKey,
    type ChannelID,
    type NetworkID,
} from '../../../../domain/audio-addict'

export type Statements = Readonly<{
    insert: Statement<
        [
            ChannelFilterID,
            NetworkID,
            ChannelFilterKey,
            string,
            string | null,
            string | null,
            string | null,
            string | null,
        ]
    >
    insertChannel: Statement<[ChannelFilterID, ChannelID]>
    getAll: Statement<[]>
    getAllForNetwork: Statement<[NetworkID]>
    getOneById: Statement<[ChannelFilterID]>
    getOneByKeyAndNetworkId: Statement<[ChannelFilterKey, NetworkID]>
}>

const load = (name: string): string =>
    readFileSync(join(__dirname, name)).toString()

export const initialize = load('./initialize.sql')

export function prepare(db: Database): Statements {
    return {
        insert: db.prepare(load('./insert.sql')),
        insertChannel: db.prepare(load('./insert-channel.sql')),
        getAll: db.prepare(load('./get-all.sql')),
        getAllForNetwork: db.prepare(load('./get-all-for-network.sql')),
        getOneById: db.prepare(load('./get-one-by-id.sql')),
        getOneByKeyAndNetworkId: db.prepare(
            load('./get-one-by-key-and-network-id.sql'),
        ),
    }
}
