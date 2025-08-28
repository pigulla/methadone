import { z } from 'zod'

import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted whenever the server receives information about the track currently being streamed.
 *
 * Note that this event may be sent multiple times with the same value (i.e., it is not only being sent on change).
 */

export const streamTrackDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('stream.track'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({ track: z.string() }),
  ),
})

export function createStreamTrackDTO(data: {
  track: string
}): z.infer<typeof streamTrackDtoSchema> {
  return streamTrackDtoSchema.parse({ event: 'stream.track', data })
}
