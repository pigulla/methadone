import {
  channelFilterIdSchema,
  channelIdSchema,
  channelKeySchema,
  networkIdSchema,
} from '@methadone/types'

import z from 'zod'

import { isoDateSchema } from './iso-date.schema.js'
import { protocollessUrlTemplateSchema } from './protocolless-url-template.schema.js'
import { sanitizeString } from './sanitize-string.js'

export const channelDtoSchema = z.object({
  id: channelIdSchema,
  channel_director: z.string().pipe(sanitizeString),
  description_long: z.string().pipe(sanitizeString),
  description_short: z.string().pipe(sanitizeString),
  key: channelKeySchema,
  name: z.string().min(1).pipe(sanitizeString),
  public: z.boolean(),
  network_id: networkIdSchema,
  asset_url: protocollessUrlTemplateSchema.nullable(),
  banner_url: protocollessUrlTemplateSchema.nullable(),
  description: z.string().pipe(sanitizeString),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  similar_channels: z.array(
    z.strictObject({ id: channelIdSchema, similar_channel_id: channelIdSchema }),
  ),
  images: z
    .strictObject({
      horizontal_banner: protocollessUrlTemplateSchema,
      tall_banner: protocollessUrlTemplateSchema,
      square: protocollessUrlTemplateSchema,
      default: protocollessUrlTemplateSchema,
      compact: protocollessUrlTemplateSchema,
      vertical: protocollessUrlTemplateSchema,
    })
    .partial(),
  channel_filter_ids: z.array(channelFilterIdSchema),
})

export const channelsDtoSchema = z.array(channelDtoSchema)
