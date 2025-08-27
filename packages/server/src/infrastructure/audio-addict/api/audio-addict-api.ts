import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { type Got, got } from 'got'
import type { JsonValue } from 'type-fest'

import { Channel } from '#domain/channel/channel.js'
import { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import { Network, type NetworkID } from '#domain/network/network.js'

import { AUDIO_ADDICT_CONFIG, type AudioAddictConfig } from '../../config/audio-addict.config.js'

import type { IAudioAddictAPI } from './audio-addict-api.interface.js'
import { channelsDtoSchema } from './dto/channel.dto.js'
import { channelFiltersDtoSchema } from './dto/channel-filter.dto.js'
import { currentlyPlayingDtoSchema } from './dto/currently-playing.dto.js'
import { networksDtoSchema } from './dto/network.dto.js'
import { IETagCache } from './etag-cache.interface.js'

@Injectable()
export class AudioAddictAPI implements IAudioAddictAPI {
  private readonly http: Got
  private readonly cache: IETagCache

  public constructor(@Inject(AUDIO_ADDICT_CONFIG) config: AudioAddictConfig, cache: IETagCache) {
    this.cache = cache
    this.http = got.extend({
      prefixUrl: config.baseUrl,
    })
  }

  private async getCached({ key, path }: { key: string; path: string }): Promise<JsonValue> {
    const cached = await this.cache.get(key)
    const response = await this.http.get<JsonValue>(path, {
      headers: cached ? { 'if-none-match': cached.etag } : {},
      responseType: 'json',
    })

    if (response.statusCode === HttpStatus.NOT_MODIFIED && cached) {
      return cached.value
    }

    if (response.headers.etag) {
      await this.cache.set(key, { etag: response.headers.etag, value: response.body })
    }

    return response.body
  }

  public async getCurrentlyPlaying(id: NetworkID): Promise<CurrentlyPlaying[]> {
    const value = await this.getCached({
      key: `currently-playing.${id}`,
      path: `v1/${id}/currently_playing`,
    })

    return currentlyPlayingDtoSchema.parse(value).map(({ channel_id, track }) =>
      CurrentlyPlaying.create({
        channelId: channel_id,
        artist: track.display_artist,
        title: track.display_title,
        startedAt: track.start_time,
        duration: [track.duration, 'seconds'],
      }),
    )
  }

  public async getNetworks(): Promise<Network[]> {
    const value = await this.getCached({ key: 'networks', path: 'v1/networks' })

    return networksDtoSchema
      .parse(value)
      .filter(network => network.active)
      .map(({ id, key, name, url }) =>
        Network.create({
          id,
          key,
          name,
          url,
        }),
      )
  }

  public async getChannels(id: NetworkID): Promise<Channel[]> {
    const value = await this.getCached({ key: `channels.${id}`, path: `v1/${id}/channels` })

    return channelsDtoSchema
      .parse(value)
      .map(({ id, key, network_id, name, channel_director, description, similar_channels }) =>
        Channel.create({
          id,
          key,
          networkId: network_id,
          name,
          director: channel_director,
          description,
          similar: similar_channels.map(({ similar_channel_id }) => similar_channel_id),
        }),
      )
  }

  public async getChannelFilters(id: NetworkID): Promise<ChannelFilter[]> {
    const value = await this.getCached({
      key: `channels-filters.${id}`,
      path: `v1/${id}/channel_filters`,
    })

    return channelFiltersDtoSchema
      .parse(value)
      .map(({ id, key, network_id, name, position, channels }) =>
        ChannelFilter.create({
          id,
          key,
          networkId: network_id,
          name,
          position,
          channels,
        }),
      )
  }
}
