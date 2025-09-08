import type { ChannelID, NetworkKey } from '@methadone/types'

import { Inject, Injectable } from '@nestjs/common'
import { type Got, got, Options } from 'got'
import { KeyvFile } from 'keyv-file'
import type { JsonValue } from 'type-fest'

import { Channel } from '#domain/channel/channel.js'
import { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import { Network } from '#domain/network/network.js'
import { listenUrlsDtoSchema } from '#infrastructure/audio-addict/api/dto/listen-urls.dto.js'

import { AUDIO_ADDICT_CONFIG, type AudioAddictConfig } from '../../config/audio-addict.config.js'

import type { IAudioAddictAPI } from './audio-addict-api.interface.js'
import { channelsDtoSchema } from './dto/channel.dto.js'
import { channelFiltersDtoSchema } from './dto/channel-filter.dto.js'
import { currentlyPlayingDtoSchema } from './dto/currently-playing.dto.js'
import { networksDtoSchema } from './dto/network.dto.js'

// For some reason, using the network id instead if its key works *sometimes* (e.g., v1/di/channels), but sometimes it
// doesn't and the API simply returns a 400 ("Invalid Network"). Not sure what's going on there so we just fall back to
// always using the key.

@Injectable()
export class AudioAddictAPI implements IAudioAddictAPI {
  private readonly http: Got

  public constructor(@Inject(AUDIO_ADDICT_CONFIG) config: AudioAddictConfig) {
    this.http = got.extend({
      cache: config.cache ? new KeyvFile() : false,
      prefixUrl: config.baseUrl,
      hooks: {
        beforeRequest: config.cache
          ? [
              // There's a bug in Got that causes requests to hang indefinitely when a 304 Not Modified is returned and
              // the content is compressed. (See: https://github.com/sindresorhus/got/issues/2410)
              (options: Options): void => {
                options.headers['accept-encoding'] = ''
              },
            ]
          : [],
      },
    })
  }

  public async getCurrentlyPlaying(
    networkKey: NetworkKey,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    const response = await this.http.get(`v1/${networkKey}/currently_playing`).json<JsonValue>()

    return new Map(
      currentlyPlayingDtoSchema.parse(response).map(
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
    const response = await this.http.get('v1/networks').json<JsonValue>()

    return networksDtoSchema
      .parse(response)
      .filter(network => network.active)
      .map(({ id, key, name, url, listen_url }) =>
        Network.create({
          id,
          key,
          name,
          url,
          listenUrl: listen_url,
        }),
      )
  }

  public async getChannels(networkKey: NetworkKey): Promise<Channel[]> {
    const response = await this.http.get(`v1/${networkKey}/channels`).json<JsonValue>()

    return channelsDtoSchema
      .parse(response)
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

  public async getChannelFilters(networkKey: NetworkKey): Promise<ChannelFilter[]> {
    const response = await this.http.get(`v1/${networkKey}/channel_filters`).json<JsonValue>()

    return channelFiltersDtoSchema
      .parse(response)
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

  public async getStreamURL(networkKey: NetworkKey, channel: Channel): Promise<string> {
    const response = await this.http
      .get(`v1/${networkKey}/listen/premium/${channel.key}`)
      .json<JsonValue>()

    return listenUrlsDtoSchema.parse(response)[0]
  }
}
