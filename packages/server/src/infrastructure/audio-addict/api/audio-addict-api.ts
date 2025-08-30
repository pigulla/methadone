import { Inject, Injectable } from '@nestjs/common'
import { type Got, got } from 'got'
import { KeyvFile } from 'keyv-file'

import { Channel, type ChannelID } from '#domain/channel/channel.js'
import { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'
import { Network, type NetworkKey } from '#domain/network/network.js'
import { IPlaylistParser } from '#infrastructure/audio-addict/api/playlist/playlist-parser.interface.js'

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
  private readonly config: AudioAddictConfig
  private readonly playlistParser: IPlaylistParser
  private readonly http: Got

  public constructor(
    @Inject(AUDIO_ADDICT_CONFIG) config: AudioAddictConfig,
    playlistParser: IPlaylistParser,
  ) {
    this.config = config
    this.playlistParser = playlistParser
    this.http = got.extend({
      cache: config.useCache ? new KeyvFile() : false,
    })
  }

  public async getCurrentlyPlaying(
    key: NetworkKey,
  ): Promise<Map<ChannelID, CurrentlyPlaying | null>> {
    const value = await this.http.get(`${this.config.baseUrl}/v1/${key}/currently_playing`).json()

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
    const data = await this.http.get(`${this.config.baseUrl}/v1/networks`).json()

    return networksDtoSchema
      .parse(data)
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

  public async getChannels(key: NetworkKey): Promise<Channel[]> {
    const value = await this.http.get(`${this.config.baseUrl}/v1/${key}/channels`).json()

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
    const value = await this.http.get(`${this.config.baseUrl}/v1/${key}/channel_filters`).json()

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

  public async getStreamURL(network: Network, channel: Channel): Promise<string> {
    const { body } = await this.http.get(`${network.listenUrl}/premium/${channel.key}.pls`)

    const playlist = this.playlistParser.parse(body)

    if (playlist.length === 0) {
      throw new Error('Empty playlist received')
    }

    return playlist[0].file
  }
}
