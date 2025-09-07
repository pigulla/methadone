import { z } from 'zod'

import { idSchema } from './id.schema.js'

export const trackIdSchema = idSchema.brand('track-id')
export type TrackID = z.infer<typeof trackIdSchema>

export function asTrackID(value: number): TrackID {
  return trackIdSchema.parse(value)
}
