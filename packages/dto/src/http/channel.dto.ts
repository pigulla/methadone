import { channelIdSchema, channelKeySchema, networkIdSchema } from '@methadone/types'

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const channelDtoSchema = z.object({
  id: channelIdSchema,
  key: channelKeySchema,
  networkId: networkIdSchema,
  name: z.string().min(1),
  director: z.string(),
  description: z.string(),
})

export const channelsDtoSchema = z.array(channelDtoSchema)

export class ChannelDTO extends createZodDto(channelDtoSchema) {}

export function createChannelDTO({
  id,
  key,
  networkId,
  name,
  director,
  description,
}: {
  id: number
  key: string
  networkId: number
  name: string
  director: string
  description: string
}): ChannelDTO {
  return ChannelDTO.create({ id, key, networkId, name, director, description })
}
