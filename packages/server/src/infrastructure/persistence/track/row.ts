import dayjs from 'dayjs'

import {
    type ArtistID,
    Track,
    type TrackID,
} from '../../../domain/audio-addict'

export type Row = {
    id: TrackID
    length: number | null
    title: string
    artist_id: ArtistID
    version: string | null
    asset_url: string | null
}

export function rowToDomain(row: Row): Track {
    return new Track({
        id: row.id,
        length:
            row.length === null ? null : dayjs.duration(row.length, 'seconds'),
        title: row.title,
        version: row.version,
        artistId: row.artist_id,
        assetUrl: row.asset_url,
    })
}
