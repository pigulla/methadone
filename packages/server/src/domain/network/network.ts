import type { JsonObject } from 'type-fest'
import z from 'zod'

import {
  asNetworkID,
  asNetworkKey,
  networkIdSchema,
  networkKeySchema,
  networkSchema,
} from './network.schema.js'

export type NetworkID = z.infer<typeof networkIdSchema>
export type NetworkKey = z.infer<typeof networkKeySchema>

export class Network {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(Network.name)

  public readonly id: NetworkID
  public readonly key: NetworkKey
  public readonly name: string
  public readonly url: string
  public readonly listenUrl: string

  public constructor(data: {
    id: NetworkID
    key: NetworkKey
    name: string
    url: string
    listenUrl: string
  }) {
    const { id, key, name, url, listenUrl } = networkSchema.loose().parse(data)

    this.id = id
    this.key = key
    this.name = name
    this.url = url
    this.listenUrl = listenUrl
  }

  public static create({
    id,
    key,
    name,
    url,
    listenUrl,
  }: {
    id: number
    key: string
    name: string
    url: string
    listenUrl: string
  }): Network {
    return new Network({
      id: asNetworkID(id),
      key: asNetworkKey(key),
      name,
      url,
      listenUrl,
    })
  }

  public toJSON(): JsonObject {
    return {
      id: this.id,
      key: this.key,
      name: this.name,
      url: this.url,
      listenUrl: this.listenUrl,
    }
  }
}
