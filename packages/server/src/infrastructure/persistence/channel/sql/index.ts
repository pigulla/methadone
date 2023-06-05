import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Database, Statement } from 'better-sqlite3'

import {
    type ChannelID,
    type ChannelKey,
    type NetworkID,
} from '../../../../domain/audio-addict'

export type Statements = Readonly<{
    insert: Statement<[ChannelID, NetworkID, ChannelKey, string]>
    insertSimilar: Statement<[ChannelID, ChannelID]>
    getAll: Statement<[]>
    getOneById: Statement<[ChannelID]>
    getOneByKeyAndNetworkId: Statement<[ChannelKey, NetworkID]>
}>

const load = (name: string): string =>
    readFileSync(join(__dirname, name)).toString()

export const initialize = load('./initialize.sql')

export function prepare(db: Database): Statements {
    return {
        insert: db.prepare(load('./insert.sql')),
        insertSimilar: db.prepare(load('./insert-similar.sql')),
        getAll: db.prepare(load('./get-all.sql')),
        getOneById: db.prepare(load('./get-one-by-id.sql')),
        getOneByKeyAndNetworkId: db.prepare(
            load('./get-one-by-key-and-network-id.sql'),
        ),
    }
}
