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
    IsISO8601,
    IsNotEmpty,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator'
import { Nullable, Optional } from 'class-validator-extended'
import dayjs, { type Dayjs } from 'dayjs'
import { type JsonObject } from 'type-fest'

import {
    IsChannelFilterID,
    IsChannelFilterKey,
    IsNetworkID,
    type NetworkID,
    ChannelFilter,
    type ChannelFilterID,
    type ChannelFilterKey,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

import { ChannelDTO } from './channel.dto'

export class ChannelFilterDTO {
    @Expose()
    @IsChannelFilterID()
    public readonly id!: ChannelFilterID

    @Expose()
    @IsNetworkID()
    public readonly network_id!: NetworkID

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly name!: string

    @Expose()
    @Optional()
    @IsChannelFilterKey()
    public readonly key!: ChannelFilterKey

    @Expose()
    @IsInt()
    @Min(0)
    public readonly position!: number

    @Expose()
    @IsBoolean()
    public readonly display!: boolean

    @Expose()
    @IsBoolean()
    public readonly meta!: boolean

    @Expose()
    @IsBoolean()
    public readonly genre!: boolean

    @Expose()
    @IsBoolean()
    public readonly display_description!: boolean

    @Expose()
    @IsString()
    public readonly description_title!: string

    @Expose()
    @IsString()
    public readonly description_text!: string

    @Expose()
    @Nullable()
    @IsISO8601({ strict: true })
    public readonly created_at!: string | null

    @Expose()
    @Nullable()
    @IsISO8601({ strict: true })
    public readonly updated_at!: Dayjs | null

    @Expose()
    @Optional()
    @IsString()
    public readonly channel_director?: string

    @Expose()
    @Type(() => ChannelDTO)
    @IsArray()
    @IsInstance(ChannelDTO, { each: true })
    @ValidateNested({ each: true })
    public readonly channels!: ChannelDTO[]

    public static fromJSON(value: JsonObject): ChannelFilterDTO {
        return validate(
            plainToInstance(ChannelFilterDTO, value, {
                excludeExtraneousValues: true,
            }),
        )
    }

    public toDomain(): ChannelFilter {
        return new ChannelFilter({
            ...this,
            networkId: this.network_id,
            title: this.description_title.trim() || null,
            text: this.description_text.trim() || null,
            createdAt: this.created_at ? dayjs(this.created_at) : null,
            updatedAt: this.updated_at ? dayjs(this.updated_at) : null,
            director: this.channel_director?.trim() || null,
            channels: new Set(this.channels.map(channel => channel.id)),
        })
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }
}
