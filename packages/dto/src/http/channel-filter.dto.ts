import {
  channelFilterIdSchema,
  channelFilterKeySchema,
  channelIdSchema,
  networkIdSchema,
} from '@methadone/types'

import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const channelFilterDtoSchema = z.object({
  id: channelFilterIdSchema,
  key: channelFilterKeySchema,
  networkId: networkIdSchema,
  name: z.string().min(1),
  position: z.number().int().min(0),
  channels: z.array(channelIdSchema),
})

export const channelFiltersDtoSchema = z.array(channelFilterDtoSchema)

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
