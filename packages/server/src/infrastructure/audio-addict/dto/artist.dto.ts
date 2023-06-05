import { Expose, instanceToPlain, plainToInstance } from 'class-transformer'
import { IsBoolean, IsISO8601, IsNotEmpty, IsString } from 'class-validator'
import { Nullable } from 'class-validator-extended'
import dayjs from 'dayjs'
import { type JsonObject } from 'type-fest'

import { Artist, type ArtistID, IsArtistID } from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class ArtistDTO {
    @Expose()
    @IsArtistID()
    public readonly id!: ArtistID

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly name!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly slug!: string

    @Expose()
    @Nullable()
    @IsString()
    public readonly bio_short!: string | null

    @Expose()
    @Nullable()
    @IsString()
    public readonly bio_long!: string | null

    @Expose()
    @IsISO8601({ strict: true })
    public readonly created_at!: string

    @Expose()
    @IsBoolean()
    public readonly has_show!: boolean

    public static fromJSON(value: JsonObject): ArtistDTO {
        return validate(
            plainToInstance(ArtistDTO, value, {
                excludeExtraneousValues: true,
            }),
        )
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }

    public toDomain(): Artist {
        return new Artist({
            ...this,
            bioShort: this.bio_short || null,
            bioLong: this.bio_long || null,
            createdAt: dayjs(this.created_at),
            hasShow: this.has_show,
        })
    }
}
