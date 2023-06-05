import { IsNotEmpty, IsString } from 'class-validator'
import { IsDayjs, Nullable } from 'class-validator-extended'
import { type Dayjs } from 'dayjs'
import { type JsonObject, type Opaque } from 'type-fest'

import { validate } from '../../util'

import { IsArtistID } from './validators'

export type ArtistID = Opaque<number, 'artist-id'>

export class Artist {
    @IsArtistID()
    public readonly id: ArtistID

    @IsString()
    @IsNotEmpty()
    public readonly name: string

    @Nullable()
    @IsString()
    @IsNotEmpty()
    public readonly bioShort: string | null

    @Nullable()
    @IsString()
    @IsNotEmpty()
    public readonly bioLong: string | null

    @IsDayjs()
    public readonly createdAt: Dayjs

    public constructor(data: {
        id: ArtistID
        name: string
        bioShort: string | null
        bioLong: string | null
        createdAt: Dayjs
    }) {
        this.id = data.id
        this.name = data.name
        this.bioShort = data.bioShort
        this.bioLong = data.bioLong
        this.createdAt = data.createdAt

        validate(this)
    }

    public toJSON(): JsonObject {
        return {
            id: this.id,
            name: this.name,
            bioShort: this.bioShort,
            bioLong: this.bioLong,
            createdAt: this.createdAt.toISOString(),
        }
    }
}
