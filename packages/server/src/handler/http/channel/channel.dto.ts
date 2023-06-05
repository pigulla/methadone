import { ApiProperty } from '@nestjs/swagger'
import {
    ArrayUnique,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
} from 'class-validator'

import {
    type Channel,
    ChannelID,
    ChannelKey,
    IsChannelID,
    IsChannelKey,
    IsNetworkID,
    NetworkID,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class ChannelDTO {
    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The id of the channel.',
        description:
            'The id of the channel. The id is unique across AudioAddict networks.',
        example: 3,
    })
    @IsChannelID()
    public readonly id: ChannelID

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The id of the network.',
        description: 'The id of the network to which this channel belongs.',
        example: 1,
    })
    @IsNetworkID()
    public readonly networkId: NetworkID

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The key of the channel.',
        description:
            'The key of the channel. The key is unique within an AudioAddict network, but not across them.',
        example: 'chillout',
    })
    @IsChannelKey()
    public readonly key: ChannelKey

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The name of the channel.',
        description: 'The human-readable name of the channel.',
        example: 'Chillout',
    })
    @IsString()
    @IsNotEmpty()
    public readonly name: string

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'Channels similar to this one.',
        description: 'Ids of channels similar to this one.',
        example: [68, 142, 275, 224, 506],
    })
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    public readonly similarChannels: readonly ChannelID[]

    public constructor(data: {
        id: ChannelID
        networkId: NetworkID
        key: ChannelKey
        name: string
        similarChannels: Iterable<ChannelID>
    }) {
        this.id = data.id
        this.networkId = data.networkId
        this.key = data.key
        this.name = data.name
        this.similarChannels = [...data.similarChannels]

        validate(this)
    }

    public static fromDomain(channel: Channel) {
        return new ChannelDTO({
            ...channel,
            similarChannels: [...channel.similarChannels],
        })
    }
}
