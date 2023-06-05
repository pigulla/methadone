import { IsNotEmpty, IsString, IsUrl } from 'class-validator'
import { IsDuration, MinDuration, Nullable } from 'class-validator-extended'
import { type Duration } from 'dayjs/plugin/duration'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'

import { type ArtistID } from './artist'
import { IsArtistID, IsTrackID } from './validators'

export type TrackID = Opaque<number, 'track-id'>

export class Track {
    @IsTrackID()
    public readonly id: TrackID

    @Nullable()
    @IsDuration()
    @MinDuration([0, 'seconds'])
    public readonly length: Duration | null

    @IsString()
    @IsNotEmpty()
    public readonly title: string

    @IsArtistID()
    public readonly artistId: ArtistID

    @Nullable()
    @IsString()
    @IsNotEmpty()
    public readonly version: string | null

    @Nullable()
    @IsUrl({ protocols: ['https'] })
    public readonly assetUrl: string | null

    public constructor(data: {
        id: TrackID
        length: Duration | null
        title: string
        version: string | null
        artistId: ArtistID
        assetUrl: string | null
    }) {
        this.id = data.id
        this.length = data.length
        this.title = data.title
        this.version = data.version
        this.artistId = data.artistId
        this.assetUrl = data.assetUrl

        validate(this)
    }
}
