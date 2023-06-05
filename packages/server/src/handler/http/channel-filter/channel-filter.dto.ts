import { ApiProperty } from '@nestjs/swagger'
import { ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator'

import {
    type ChannelFilter,
    ChannelFilterID,
    ChannelFilterKey,
    type ChannelID,
    IsChannelFilterID,
    IsChannelID,
    IsChannelKey,
    IsNetworkID,
    NetworkID,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class ChannelFilterDTO {
    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The id of the channel filter.',
        description:
            'The id of the channel filter. The id is unique across AudioAddict networks.',
        example: 69,
    })
    @IsChannelFilterID()
    public readonly id: ChannelFilterID

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The id of the network.',
        description:
            'The id of the network to which this channel filter belongs.',
        example: 1,
    })
    @IsNetworkID()
    public readonly networkId: NetworkID

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The key of the channel filter.',
        description:
            'The key of the channel filter. The key is unique within an AudioAddict network, but not across them.',
        example: 'synth',
    })
    @IsChannelKey()
    public readonly key: ChannelFilterKey

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The name of the channel filter.',
        description: 'The human-readable name of the channel filter.',
        example: 'Synth',
    })
    @IsString()
    @IsNotEmpty()
    public readonly name: string

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'Channels included by this filter.',
        description: 'Ids of channels included by this filter.',
        example: [438, 53, 280, 351, 286],
    })
    @IsArray()
    @ArrayUnique()
    @IsChannelID({ each: true })
    public readonly channels: readonly ChannelID[]

    public constructor(data: {
        id: ChannelFilterID
        networkId: NetworkID
        key: ChannelFilterKey
        name: string
        channels: Iterable<ChannelID>
    }) {
        this.id = data.id
        this.networkId = data.networkId
        this.key = data.key
        this.name = data.name
        this.channels = [...data.channels]

        validate(this)
    }

    public static fromDomain(channelFilter: ChannelFilter) {
        return new ChannelFilterDTO(channelFilter)
    }
}
