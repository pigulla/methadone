import { Expose, instanceToPlain, plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator'
import { Nullable } from 'class-validator-extended'
import { type JsonObject } from 'type-fest'

import { ArtistID, IsArtistID } from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class EmbeddedArtistDTO {
    @Expose()
    @IsArtistID()
    public readonly id!: ArtistID

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly name!: string

    @Expose()
    @Nullable()
    @Matches(/^\/\//)
    @IsUrl({
        require_protocol: false,
        allow_protocol_relative_urls: true,
    })
    public readonly asset_url!: string | null

    public static fromJSON(value: JsonObject): EmbeddedArtistDTO {
        return validate(
            plainToInstance(EmbeddedArtistDTO, value, {
                excludeExtraneousValues: true,
            }),
        )
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }
}
