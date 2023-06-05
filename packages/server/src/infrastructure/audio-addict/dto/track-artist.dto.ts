import { instanceToPlain, plainToInstance } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { type JsonObject } from 'type-fest'

import {
    ArtistID,
    IsArtistID,
    TrackArtistType,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class TrackArtistDTO {
    @IsArtistID()
    public readonly id!: ArtistID

    @IsEnum(TrackArtistType)
    public readonly type!: TrackArtistType

    @IsString()
    @IsNotEmpty()
    public readonly name!: string

    @IsString()
    @IsNotEmpty()
    public readonly slug!: string

    public static fromJSON(value: JsonObject): TrackArtistDTO {
        return validate(plainToInstance(TrackArtistDTO, value))
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }
}
