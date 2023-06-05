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
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    Matches,
    ValidateNested,
} from 'class-validator'
import { Nullable, Optional } from 'class-validator-extended'
import { type JsonObject } from 'type-fest'

import {
    Channel,
    type ChannelID,
    type ChannelKey,
    IsChannelID,
    IsChannelKey,
    IsNetworkID,
    type NetworkID,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

import { EmbeddedArtistDTO } from './embedded-artist.dto'

export class SimilarChannelDTO {
    @Expose()
    @IsInt()
    @IsPositive()
    public readonly id!: number

    @Expose()
    @IsChannelID()
    public readonly similar_channel_id!: ChannelID
}

export class ChannelDTO {
    @Expose()
    @IsChannelID()
    public readonly id!: ChannelID

    @Expose()
    @IsChannelKey()
    public readonly key!: ChannelKey

    @Expose()
    @IsNetworkID()
    public readonly network_id!: NetworkID

    @Expose()
    @Nullable()
    @IsInt()
    @IsPositive()
    public readonly asset_id!: number | null

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly name!: string

    @Expose()
    @Optional()
    @IsString()
    public readonly description?: string

    @Expose()
    @Optional()
    @IsString()
    public readonly description_short?: string

    @Expose()
    @Optional()
    @IsString()
    public readonly description_long?: string

    @Expose()
    @Optional()
    @IsString()
    public readonly ad_dfp_unit_id?: string

    @Expose()
    @IsBoolean()
    public readonly public!: boolean

    @Optional()
    @Matches(/^\/\//)
    @IsUrl({
        require_protocol: false,
        allow_protocol_relative_urls: true,
    })
    public readonly asset_url?: string

    @IsOptional()
    @Matches(/^\/\//)
    @IsUrl({
        require_protocol: false,
        allow_protocol_relative_urls: true,
    })
    public readonly banner_url?: string | null | undefined

    @Expose()
    @Type(() => SimilarChannelDTO)
    @IsArray()
    @IsInstance(SimilarChannelDTO, { each: true })
    @ValidateNested({ each: true })
    public readonly similar_channels!: SimilarChannelDTO[]

    @Expose()
    @Type(() => EmbeddedArtistDTO)
    @IsArray()
    @IsInstance(EmbeddedArtistDTO, { each: true })
    @ValidateNested({ each: true })
    public readonly artists!: EmbeddedArtistDTO[]

    public static fromJSON(value: JsonObject): ChannelDTO {
        return validate(
            plainToInstance(ChannelDTO, value, {
                excludeExtraneousValues: true,
            }),
        )
    }

    public toDomain(): Channel {
        return new Channel({
            ...this,
            networkId: this.network_id,
            similarChannels: new Set(
                this.similar_channels.map(item => item.similar_channel_id),
            ),
        })
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }
}
