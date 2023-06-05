import { Injectable } from '@nestjs/common'
import { type Database } from 'better-sqlite3'

import {
    type Artist,
    type ArtistID,
    type IArtistRepository,
} from '../../../domain/audio-addict'
import { ArtistNotFoundError } from '../../../domain/audio-addict/error'
import { IDatabaseConnection } from '../database-connection.interface'

import { rowToDomain, type Row } from './row'
import { initialize, prepare, type Statements } from './sql'

@Injectable()
export class ArtistRepository implements IArtistRepository {
    private readonly db: Database
    private readonly statements: Statements

    public constructor(databaseConnection: IDatabaseConnection) {
        this.db = databaseConnection.db.exec(initialize)
        this.statements = prepare(this.db)
    }

    public insertArtist(artist: Artist): void {
        this.statements.insert.run(
            artist.id,
            artist.name,
            artist.bioShort,
            artist.bioLong,
            artist.createdAt.toISOString(),
        )
    }

    public findArtist(artistId: ArtistID): Artist | null {
        const row = this.statements.getOneById.get(artistId) as Row | undefined

        return row ? rowToDomain(row) : null
    }

    public getArtist(artistId: ArtistID): Artist {
        const artist = this.findArtist(artistId)

        if (!artist) {
            throw new ArtistNotFoundError(artistId)
        }

        return artist
    }
}
