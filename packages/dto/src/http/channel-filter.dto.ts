import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const channelFilterDtoSchema = z.object({
  id: idSchema,
  key: keySchema,
  networkId: idSchema,
  name: z.string().min(1),
  position: z.number().int().min(0),
  channels: z.array(idSchema),
})

export class ChannelFilterDTO extends createZodDto(channelFilterDtoSchema) {}

export function createChannelFilterDTO({
  id,
  key,
  networkId,
  name,
  position,
  channels,
}: {
  id: number
  key: string
  networkId: number
  name: string
  position: number
  channels: number[]
}): ChannelFilterDTO {
  return ChannelFilterDTO.create({ id, key, networkId, name, position, channels })
}
