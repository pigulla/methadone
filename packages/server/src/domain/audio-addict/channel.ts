import { IsNotEmpty, IsString } from 'class-validator'
import { IsSet } from 'class-validator-extended'
import { type JsonObject, type Opaque } from 'type-fest'

import { validate } from '../../util'

import { type NetworkID } from './network'
import { IsChannelID, IsChannelKey, IsNetworkID } from './validators'

export type ChannelID = Opaque<number, 'channel-id'>
export type ChannelKey = Opaque<string, 'channel-string'>

export class Channel {
    @IsChannelID()
    public readonly id: ChannelID

    @IsNetworkID()
    public readonly networkId: NetworkID

    @IsChannelKey()
    public readonly key: ChannelKey

    @IsString()
    @IsNotEmpty()
    public readonly name: string

    @IsSet()
    @IsChannelID({ each: true })
    public readonly similarChannels: ReadonlySet<ChannelID>

    public constructor(data: {
        id: ChannelID
        networkId: NetworkID
        key: ChannelKey
        name: string
        similarChannels: Set<ChannelID>
    }) {
        this.id = data.id
        this.networkId = data.networkId
        this.key = data.key
        this.name = data.name
        this.similarChannels = new Set(data.similarChannels)

        validate(this)
    }

    public equals(other: Channel): boolean {
        return this.id === other.id
    }

    public toJSON(): JsonObject {
        return {
            id: this.id,
            networkId: this.networkId,
            key: this.key,
            name: this.name,
            similarChannels: [...this.similarChannels],
        }
    }
}
