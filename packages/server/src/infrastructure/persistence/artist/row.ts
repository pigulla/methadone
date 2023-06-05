import dayjs from 'dayjs'

import { Artist, type ArtistID } from '../../../domain/audio-addict'

export type Row = {
    id: ArtistID
    name: string
    bio_short: string | null
    bio_long: string | null
    created_at: string
}

export function rowToDomain(row: Row): Artist {
    return new Artist({
        ...row,
        bioShort: row.bio_short,
        bioLong: row.bio_long,
        createdAt: dayjs(row.created_at),
    })
}
