import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const networkDtoSchema = z.object({
  id: idSchema,
  key: keySchema,
  name: z.string().min(1),
  url: z.httpUrl(),
})

export class NetworkDTO extends createZodDto(networkDtoSchema) {}

export function createNetworkDTO({
  id,
  key,
  name,
  url,
}: {
  id: number
  key: string
  name: string
  url: string
}): NetworkDTO {
  return NetworkDTO.create({ id, key, name, url })
}
