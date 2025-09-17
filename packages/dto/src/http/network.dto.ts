import { networkIdSchema, networkKeySchema } from '@digitally-exported/types'

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const networkDtoSchema = z.object({
  id: networkIdSchema,
  key: networkKeySchema,
  name: z.string().min(1),
  url: z.httpUrl(),
})

export const networksDtoSchema = z.array(networkDtoSchema)

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
