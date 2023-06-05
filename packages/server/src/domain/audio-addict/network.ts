import { IsNotEmpty, IsString, IsUrl } from 'class-validator'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'

import { IsNetworkID, IsNetworkKey } from './validators'

export type NetworkID = Opaque<number, 'network-id'>
export type NetworkKey = Opaque<string, 'network-key'>

export class Network {
    @IsNetworkID()
    public readonly id: NetworkID

    @IsNetworkKey()
    public readonly key: NetworkKey

    @IsString()
    @IsNotEmpty()
    public readonly name: string

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
}
