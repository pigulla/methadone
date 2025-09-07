import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const channelIdSchema = idSchema.brand('channel-id')
export type ChannelID = z.infer<typeof channelIdSchema>

export function asChannelID(value: number): ChannelID {
  return channelIdSchema.parse(value)
}

export const channelKeySchema = keySchema.brand('channel-key')
export type ChannelKey = z.infer<typeof channelKeySchema>

export function asChannelKey(value: string): ChannelKey {
  return channelKeySchema.parse(value)
}
