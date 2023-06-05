import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Database, Statement } from 'better-sqlite3'

import { type ArtistID, type TrackID } from '../../../../domain/audio-addict'

export type Statements = Readonly<{
    insert: Statement<
        [TrackID, number | null, string, ArtistID, string | null, string | null]
    >
    getOneById: Statement<[TrackID]>
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
