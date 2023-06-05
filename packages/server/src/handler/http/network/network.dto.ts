import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsPositive, IsString, IsUrl } from 'class-validator'

import {
    IsNetworkID,
    IsNetworkKey,
    type Network,
    NetworkID,
    NetworkKey,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class NetworkDTO {
    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The id of the network.',
        description: 'The id of the network.',
        example: 1,
    })
    @IsNetworkID()
    public readonly id: NetworkID

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The key of the network.',
        description: 'The key of the network.',
        example: 'di',
    })
    @IsNetworkKey()
    public readonly key: NetworkKey

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The name of the network.',
        description: 'The human-readable name of the network.',
        example: 'DI.FM',
    })
    @IsString()
    @IsNotEmpty()
    public readonly name: string

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The URL of the network.',
        description: `The URL of the network's website.`,
        example: 'https://www.di.fm',
    })
    @IsUrl({ protocols: ['https', 'http'] })
    public readonly url: string

    public constructor(data: {
        id: NetworkID
        key: NetworkKey
        name: string
        url: string
    }) {
        this.id = data.id
        this.key = data.key
        this.name = data.name
        this.url = data.url

        validate(this)
    }

    public static fromDomain(network: Network) {
        return new NetworkDTO(network)
    }
}
