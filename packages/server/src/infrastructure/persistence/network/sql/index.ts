import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Database, Statement } from 'better-sqlite3'

import {
    type NetworkID,
    type NetworkKey,
} from '../../../../domain/audio-addict'

export type Statements = Readonly<{
    insert: Statement<[NetworkID, NetworkKey, string, string]>
    getAll: Statement<[]>
    getOneById: Statement<[NetworkID]>
    getOneByKey: Statement<[NetworkKey]>
}>

const load = (name: string): string =>
    readFileSync(join(__dirname, name)).toString()

export const initialize = load('./initialize.sql')

export function prepare(db: Database): Statements {
    return {
        insert: db.prepare(load('./insert.sql')),
        getAll: db.prepare(load('./get-all.sql')),
        getOneById: db.prepare(load('./get-one-by-id.sql')),
        getOneByKey: db.prepare(load('./get-one-by-key.sql')),
    }
}
