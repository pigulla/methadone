import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { type Got, got } from 'got'
import type { JsonValue } from 'type-fest'

import { Channel, type ChannelID } from '#domain/channel/channel.js'
import { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import { Network, type NetworkKey } from '#domain/network/network.js'

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

  public async getCurrentlyPlaying(
    key: NetworkKey,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    // Sometimes using the network id instead if its key works (e.g., v1/di/channels), but sometimes it doesn't and
    // the API simply returns a 400 ("Invalid Network"). Not sure what's going on there so we just fall back to always
    // using the key.
    const value = await this.getCached({
      key: `currently-playing.${key}`,
      path: `v1/${key}/currently_playing`,
    })

    return new Map(
      currentlyPlayingDtoSchema.parse(value).map(
        ({ channel_id, track }) =>
          [
            channel_id,
            track
              ? CurrentlyPlaying.create({
                  artist: track.display_artist,
                  title: track.display_title,
                  startedAt: track.start_time,
                  duration: [track.duration, 'seconds'],
                })
              : null,
          ] as const,
      ),
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

  public async getChannels(key: NetworkKey): Promise<Channel[]> {
    // Sometimes using the network id instead if its key works (e.g., v1/di/channels), but sometimes it doesn't and
    // the API simply returns a 400 ("Invalid Network"). Not sure what's going on there so we just fall back to always
    // using the key.
    const value = await this.getCached({ key: `channels.${key}`, path: `v1/${key}/channels` })

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

  public async getChannelFilters(key: NetworkKey): Promise<ChannelFilter[]> {
    // Sometimes using the network id instead if its key works (e.g., v1/di/channels), but sometimes it doesn't and
    // the API simply returns a 400 ("Invalid Network"). Not sure what's going on there so we just fall back to always
    // using the key.
    const value = await this.getCached({
      key: `channels-filters.${key}`,
      path: `v1/${key}/channel_filters`,
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
