import { IsNotEmpty, IsString } from 'class-validator'
import { IsDayjs, IsSet, Nullable } from 'class-validator-extended'
import { type Dayjs } from 'dayjs'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'

import { type ChannelID } from './channel'
import { type NetworkID } from './network'
import {
    IsChannelFilterID,
    IsChannelFilterKey,
    IsChannelID,
    IsNetworkID,
} from './validators'

export type ChannelFilterID = Opaque<number, 'channel-filter-id'>
export type ChannelFilterKey = Opaque<string, 'channel-filter-key'>

export class ChannelFilter {
    @IsChannelFilterID()
    public readonly id: ChannelFilterID

    @IsNetworkID()
    public readonly networkId: NetworkID

    @IsString()
    @IsNotEmpty()
    public readonly name: string

    @IsChannelFilterKey()
    public readonly key: ChannelFilterKey

    @Nullable()
    @IsString()
    @IsNotEmpty()
    public readonly title: string | null

    @Nullable()
    @IsString()
    @IsNotEmpty()
    public readonly text: string | null

    @Nullable()
    @IsDayjs()
    public readonly createdAt!: Dayjs | null

    @Nullable()
    @IsDayjs()
    public readonly updatedAt!: Dayjs | null

    @IsSet()
    @IsChannelID({ each: true })
    public readonly channels: ReadonlySet<ChannelID>

    public constructor(data: {
        id: ChannelFilterID
        name: string
        networkId: NetworkID
        key: ChannelFilterKey
        title: string | null
        text: string | null
        createdAt: Dayjs | null
        updatedAt: Dayjs | null
        channels: Set<ChannelID>
    }) {
        this.id = data.id
        this.name = data.name
        this.networkId = data.networkId
        this.key = data.key
        this.title = data.title
        this.text = data.text
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.channels = new Set(data.channels)

        validate(this)
    }
}
