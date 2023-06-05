import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Database, Statement } from 'better-sqlite3'

import { type ArtistID } from '../../../../domain/audio-addict'

export type Statements = Readonly<{
    insert: Statement<[ArtistID, string, string | null, string | null, string]>
    getOneById: Statement<[ArtistID]>
}>

const load = (name: string): string =>
    readFileSync(join(__dirname, name)).toString()

export const initialize = load('./initialize.sql')

export function prepare(db: Database): Statements {
    return {
        insert: db.prepare(load('./insert.sql')),
        getOneById: db.prepare(load('./get-one-by-id.sql')),
    }
}
