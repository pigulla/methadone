import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { channelDtoSchema, createChannelDTO } from './channel.dto.js'
import { createNetworkDTO, networkDtoSchema } from './network.dto.js'

export const currentlyPlayingDtoSchema = z.strictObject({
  track: z.string(),
  network: networkDtoSchema,
  channel: channelDtoSchema,
})

export function createCurrentlyPlayingDTO(data: {
  track: string
  network: Parameters<typeof createNetworkDTO>[0]
  channel: Parameters<typeof createChannelDTO>[0]
}): z.infer<typeof currentlyPlayingDtoSchema> {
  return currentlyPlayingDtoSchema.parse(data)
}

export class CurrentlyPlayingDto extends createZodDto(currentlyPlayingDtoSchema) {}
