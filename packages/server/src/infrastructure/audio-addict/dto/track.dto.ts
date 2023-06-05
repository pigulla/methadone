import {
    Expose,
    instanceToPlain,
    plainToInstance,
    Type,
} from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsInstance,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    Min,
    ValidateNested,
} from 'class-validator'
import { Nullable, Optional } from 'class-validator-extended'
import dayjs from 'dayjs'
import { type JsonObject } from 'type-fest'

import { IsTrackID, Track, type TrackID } from '../../../domain/audio-addict'
import { validate } from '../../../util'

import { EmbeddedArtistDTO } from './embedded-artist.dto'
import { TrackArtistDTO } from './track-artist.dto'

export class TrackDTO {
    @Expose()
    @IsTrackID()
    public readonly id!: TrackID

    @Expose()
    @Optional()
    @IsNumber()
    @Min(0)
    public readonly length?: number

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly title!: string

    @Expose()
    @Nullable()
    @IsString()
    public readonly version!: string | null

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly display_title!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly display_artist!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly track!: string

    @Expose()
    @Optional()
    @IsBoolean()
    public readonly mix?: boolean

    @Expose()
    @IsOptional()
    @Matches(/^\/\//)
    @IsUrl({
        require_protocol: false,
        allow_protocol_relative_urls: true,
    })
    public readonly asset_url?: string | null

    @Expose()
    @Type(() => TrackArtistDTO)
    @IsArray()
    @IsInstance(TrackArtistDTO, { each: true })
    @ValidateNested({ each: true })
    public readonly artists!: TrackArtistDTO[]

    @Expose()
    @Type(() => EmbeddedArtistDTO)
    @IsInstance(EmbeddedArtistDTO)
    @ValidateNested()
    public readonly artist!: EmbeddedArtistDTO

    public static fromJSON(value: JsonObject): TrackDTO {
        return validate(plainToInstance(TrackDTO, value), {
            forbidUnknownValues: true,
            forbidNonWhitelisted: true,
        })
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }

    public toDomain(): Track {
        return new Track({
            id: this.id,
            length:
                this.length === undefined
                    ? null
                    : dayjs.duration(this.length, 'seconds'),
            version: this.version?.trim() || null,
            title: this.title.trim(),
            artistId: this.artist.id,
            assetUrl: this.asset_url ? `https:${this.asset_url}` : null,
        })
    }
}
