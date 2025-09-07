import { channelFilterIdSchema, channelFilterKeySchema, networkIdSchema } from '@methadone/types'

import z from 'zod'

import { channelDtoSchema } from './channel.dto.js'
import { isoDateSchema } from './iso-date.schema.js'
import { protocollessUrlTemplateSchema } from './protocolless-url-template.schema.js'
import { sanitizeString } from './sanitize-string.js'

const channelFilterDtoSchema = z.object({
  id: channelFilterIdSchema,
  description_text: z.string().pipe(sanitizeString),
  description_title: z.string().pipe(sanitizeString),
  key: channelFilterKeySchema,
  name: z.string().min(1).pipe(sanitizeString),
  position: z.number().int().min(0),
  network_id: networkIdSchema,
  created_at: isoDateSchema.nullable(),
  updated_at: isoDateSchema.nullable(),
  images: z
    .strictObject({
      compact: protocollessUrlTemplateSchema,
      default: protocollessUrlTemplateSchema,
      horizontal_banner: protocollessUrlTemplateSchema,
    })
    .partial(),
  channels: z.array(channelDtoSchema).transform(channels => channels.map(channel => channel.id)),
})

export const channelFiltersDtoSchema = z.array(channelFilterDtoSchema)
