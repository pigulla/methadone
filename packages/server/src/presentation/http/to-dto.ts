import { ChannelDTO, channelDtoSchema } from '@methadone/dto/channel.dto.js'
import { ChannelFilterDTO, channelFilterDtoSchema } from '@methadone/dto/channel-filter.dto.js'
import { NetworkDTO, networkDtoSchema } from '@methadone/dto/network.dto.js'
import { type TrackDTO, trackDtoSchema } from '@methadone/dto/track.dto.js'

import type { Channel } from '#domain/channel/channel.js'
import type { ChannelFilter } from '#domain/channel-filter/channel-filter.js'
import type { Network } from '#domain/network/network.js'
import type { Track } from '#domain/track/track.js'

export function trackToDTO(track: Track): TrackDTO {
  return trackDtoSchema.parse({
    title: track.title,
    artist: track.artist,
  })
}

export function channelToDTO(channel: Channel): ChannelDTO {
  return channelDtoSchema.parse({
    id: channel.id,
    key: channel.key,
    networkId: channel.networkId,
    name: channel.name,
    director: channel.director,
    description: channel.description,
  })
}

export function channelFilterToDTO(channelFilter: ChannelFilter): ChannelFilterDTO {
  return channelFilterDtoSchema.parse({
    id: channelFilter.id,
    key: channelFilter.key,
    networkId: channelFilter.networkId,
    name: channelFilter.name,
    position: channelFilter.position,
    channels: [...channelFilter.channels],
  })
}

export function networkToDTO(network: Network): NetworkDTO {
  return networkDtoSchema.parse({
    id: network.id,
    key: network.key,
    name: network.name,
    url: network.url,
  })
}
