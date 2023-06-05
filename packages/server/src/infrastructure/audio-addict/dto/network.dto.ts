import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, IsUrl } from 'class-validator'
import { type JsonObject } from 'type-fest'

import {
    IsNetworkID,
    IsNetworkKey,
    Network,
    type NetworkID,
    type NetworkKey,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class NetworkDTO {
    @IsNetworkID()
    public readonly id!: NetworkID

    @IsNetworkKey()
    public readonly key!: NetworkKey

    @IsString()
    @IsNotEmpty()
    public readonly name!: string

    @IsUrl({ protocols: ['https'] })
    public readonly url!: string

    public static fromJSON(value: JsonObject): NetworkDTO {
        return validate(plainToInstance(NetworkDTO, value))
    }

    public toDomain(): Network {
        return new Network(this)
    }
}
