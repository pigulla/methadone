import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const channelDtoSchema = z.object({
  id: idSchema,
  key: keySchema,
  networkId: idSchema,
  name: z.string().min(1),
  director: z.string(),
  description: z.string(),
})

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
