import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const channelFilterIdSchema = idSchema.brand('channel-filter-id')
export type ChannelFilterID = z.infer<typeof channelFilterIdSchema>

export function asChannelFilterID(value: number): ChannelFilterID {
  return channelFilterIdSchema.parse(value)
}

export const channelFilterKeySchema = keySchema.brand('channel-filter-key')
export type ChannelFilterKey = z.infer<typeof channelFilterKeySchema>

export function asChannelFilterKey(value: unknown): ChannelFilterKey {
  return channelFilterKeySchema.parse(value)
}
