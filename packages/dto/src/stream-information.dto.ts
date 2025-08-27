import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { channelDtoSchema, createChannelDTO } from './channel.dto.js'
import { createNetworkDTO, networkDtoSchema } from './network.dto.js'

export const streamInformationDtoSchema = z.strictObject({
  track: z.string(),
  network: networkDtoSchema,
  channel: channelDtoSchema,
})

export class StreamInformationDTO extends createZodDto(streamInformationDtoSchema) {}

export function createStreamInformationDTO({
  track,
  network,
  channel,
}: {
  track: string
  network: Parameters<typeof createNetworkDTO>[0]
  channel: Parameters<typeof createChannelDTO>[0]
}): StreamInformationDTO {
  return StreamInformationDTO.create({
    track,
    network: {
      id: network.id,
      key: network.key,
      name: network.name,
      url: network.url,
    },
    channel: {
      id: channel.id,
      key: channel.key,
      networkId: channel.networkId,
      name: channel.name,
      director: channel.director,
      description: channel.description,
    },
  })
}
