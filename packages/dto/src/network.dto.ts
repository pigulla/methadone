import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const networkDtoSchema = z.strictObject({
  id: idSchema,
  key: keySchema,
  name: z.string().min(1),
  url: z.httpUrl(),
})

export function createNetworkDTO(data: {
  id: number
  key: string
  name: string
  url: string
}): z.infer<typeof networkDtoSchema> {
  return networkDtoSchema.parse(data)
}

export class NetworkDTO extends createZodDto(networkDtoSchema) {}
