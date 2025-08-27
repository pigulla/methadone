import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const channelDtoSchema = z.strictObject({
  id: idSchema,
  key: keySchema,
  networkId: idSchema,
  name: z.string().min(1),
  director: z.string(),
  description: z.string(),
})

export function createChannelDTO(data: {
  id: number
  key: string
  networkId: number
  name: string
  director: string
  description: string
}): z.infer<typeof channelDtoSchema> {
  return channelDtoSchema.parse(data)
}

export class ChannelDTO extends createZodDto(channelDtoSchema) {}
