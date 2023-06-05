import { Expose, plainToInstance, Type } from 'class-transformer'
import {
    IsEnum,
    IsInstance,
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator'
import { Optional } from 'class-validator-extended'
import { type JsonObject } from 'type-fest'

import { PlayerState } from '../../../domain/vlc'
import { validate } from '../../../util'

import { AudioStreamDTO } from './audio-stream.dto'
import { MetaDTO } from './meta.dto'

export class CategoryDTO {
    @Expose()
    @Type(() => MetaDTO)
    @IsInstance(MetaDTO)
    @ValidateNested()
    public readonly meta!: MetaDTO

    @Expose({ name: 'Stream 0' })
    @Optional()
    @Type(() => AudioStreamDTO)
    @IsInstance(AudioStreamDTO)
    @ValidateNested()
    public readonly Stream?: AudioStreamDTO
}

export class InformationDTO {
    @Expose()
    @Type(() => CategoryDTO)
    @IsInstance(CategoryDTO)
    @ValidateNested()
    public readonly category!: CategoryDTO
}

export class StatusDTO {
    @Expose()
    @IsInt()
    @Min(0)
    public readonly volume!: number

    @Expose()
    @IsInt()
    public readonly time!: number

    @Expose()
    @IsEnum(PlayerState)
    public readonly state!: PlayerState

    @Expose()
    @Optional()
    @Type(() => InformationDTO)
    @IsInstance(InformationDTO)
    @ValidateNested()
    public readonly information?: InformationDTO

    @Expose()
    @IsInt()
    @IsPositive()
    public readonly apiversion!: number

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly version!: string

    public static fromJSON(value: JsonObject): StatusDTO {
        return validate(
            plainToInstance(StatusDTO, value, {
                excludeExtraneousValues: true,
            }),
        )
    }
}
