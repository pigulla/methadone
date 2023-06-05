import {
    Expose,
    instanceToPlain,
    plainToInstance,
    Transform,
} from 'class-transformer'
import { IsUrl, Matches } from 'class-validator'
import { Optional } from 'class-validator-extended'
import { type JsonObject } from 'type-fest'

import { validate } from '../../../util'

export class ImagesDTO {
    @Expose()
    @Optional()
    @Matches(/^\/\//)
    @Transform(
        ({ value }) => {
            const matches = /(?<url>.+\.jpg)(\{\?.+\})?$/.exec(value as string)
            return matches?.groups?.url ?? (value as string)
        },
        {
            toClassOnly: true,
        },
    )
    @IsUrl({
        require_protocol: false,
        allow_protocol_relative_urls: true,
    })
    public readonly default?: string

    public static fromJSON(value: JsonObject): ImagesDTO {
        return validate(plainToInstance(ImagesDTO, value))
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }
}
