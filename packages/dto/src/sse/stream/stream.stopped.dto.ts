import { z } from 'zod'

import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted when the server has stopped streaming.
 */

export const streamStoppedDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('stream.stopped'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({}),
  ),
})

export function createStreamStoppedDTO(): z.infer<typeof streamStoppedDtoSchema> {
  return streamStoppedDtoSchema.parse({ event: 'stream.stopped', data: {} })
}
