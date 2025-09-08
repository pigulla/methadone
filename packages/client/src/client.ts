import {
  ChannelDTO,
  ChannelFilterDTO,
  channelFiltersDtoSchema,
  channelsDtoSchema,
  NetworkDTO,
  networkDtoSchema,
  networksDtoSchema,
} from '@methadone/dto'
import type { ChannelKey, NetworkKey } from '@methadone/types'

import ky, { HTTPError, type KyInstance } from 'ky'
import type { JsonValue } from 'type-fest'

import { NetworkNotFoundError } from './error/network-not-found.error.js'
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

  public async startStream({
    networkKey,
    channelKey,
  }: {
    networkKey: NetworkKey
    channelKey: ChannelKey
  }): Promise<void> {
    await this.ky.post(`stream/${networkKey}/${channelKey}`)
  }

  public async stopStream(): Promise<void> {
    await this.ky.delete('stream')
  }

  public async getNetworks(): Promise<NetworkDTO[]> {
    const response = await this.ky.get('networks').json<JsonValue>()

    return networksDtoSchema.parse(response)
  }

  public async getNetwork(networkKey: NetworkKey): Promise<NetworkDTO> {
    let response: JsonValue

    try {
      response = await this.ky.get(`network/${networkKey}`).json<JsonValue>()
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw new NetworkNotFoundError(networkKey)
      }

      throw error
    }

    return networkDtoSchema.parse(response)
  }

  public async getChannels(networkKey: NetworkKey): Promise<ChannelDTO[]> {
    let response: JsonValue

    try {
      response = await this.ky.get(`networks/${networkKey}/channels`).json<JsonValue>()
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw new NetworkNotFoundError(networkKey)
      }

      throw error
    }

    return channelsDtoSchema.parse(response)
  }

  public async getChannelFilters(networkKey: NetworkKey): Promise<ChannelFilterDTO[]> {
    let response: JsonValue

    try {
      response = await this.ky.get(`networks/${networkKey}/channel-filters`).json<JsonValue>()
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw new NetworkNotFoundError(networkKey)
      }

      throw error
    }

    return channelFiltersDtoSchema.parse(response)
  }
}
