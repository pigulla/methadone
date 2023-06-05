import { Injectable } from '@nestjs/common'
import { type Database } from 'better-sqlite3'

import {
    type Track,
    type TrackID,
    type ITrackRepository,
} from '../../../domain/audio-addict'
import { TrackNotFoundError } from '../../../domain/audio-addict/error'
import { IDatabaseConnection } from '../database-connection.interface'

import { rowToDomain, type Row } from './row'
import { initialize, prepare, type Statements } from './sql'

@Injectable()
export class TrackRepository implements ITrackRepository {
    private readonly db: Database
    private readonly statements: Statements

    public constructor(databaseConnection: IDatabaseConnection) {
        this.db = databaseConnection.db.exec(initialize)
        this.statements = prepare(this.db)
    }

    public insertTrack(track: Track): void {
        this.statements.insert.run(
            track.id,
            track.length?.asSeconds() ?? null,
            track.title,
            track.artistId,
            track.version,
            track.assetUrl,
        )
    }

    public findTrack(trackId: TrackID): Track | null {
        const row = this.statements.getOneById.get(trackId) as Row | undefined

        return row ? rowToDomain(row) : null
    }

    public getTrack(trackId: TrackID): Track {
        const track = this.findTrack(trackId)

        if (!track) {
            throw new TrackNotFoundError(trackId)
        }

        return track
    }
}
