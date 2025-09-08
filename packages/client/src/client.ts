import {
  ChannelDTO,
  ChannelFilterDTO,
  channelFiltersDtoSchema,
  channelsDtoSchema,
  NetworkDTO,
  networksDtoSchema,
} from '@methadone/dto'
import type { NetworkKey } from '@methadone/types'

import type { KyInstance } from 'ky'
import ky from 'ky'
import type { JsonValue } from 'type-fest'

import { type Options, optionsSchema } from './options.js'

export class Client {
  private readonly ky: KyInstance

  public constructor(options: Options) {
    const { url } = optionsSchema.parse(options)

    this.ky = ky.extend({
      prefixUrl: url,
      headers: options.apiKey === false ? {} : { 'x-api-key': options.apiKey },
    })
  }

  public async getNetworks(): Promise<NetworkDTO[]> {
    const response = await this.ky.get('networks').json<JsonValue>()

    return networksDtoSchema.parse(response)
  }

  public async getChannels(networkKey: NetworkKey): Promise<ChannelDTO[]> {
    const response = await this.ky.get(`networks/${networkKey}/channels`).json<JsonValue>()

    return channelsDtoSchema.parse(response)
  }

  public async getChannelFilters(networkKey: NetworkKey): Promise<ChannelFilterDTO[]> {
    const response = await this.ky.get(`networks/${networkKey}/channel-filters`).json<JsonValue>()

    return channelFiltersDtoSchema.parse(response)
  }
}
