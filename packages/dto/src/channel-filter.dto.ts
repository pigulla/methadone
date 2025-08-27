import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const channelFilterDtoSchema = z.strictObject({
  id: idSchema,
  key: keySchema,
  networkId: idSchema,
  name: z.string().min(1),
  position: z.number().int().min(0),
  channels: z.array(idSchema),
})

export function createChannelFilterDTO(data: {
  id: number
  key: string
  networkId: number
  name: string
  position: number
  channels: number[]
}): z.infer<typeof channelFilterDtoSchema> {
  return channelFilterDtoSchema.parse(data)
}

export class ChannelFilterDTO extends createZodDto(channelFilterDtoSchema) {}
