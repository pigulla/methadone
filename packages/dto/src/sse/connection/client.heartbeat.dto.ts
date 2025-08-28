import { z } from 'zod'

import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted as keep-alive mechanism for the SSE connection. The client is not expected to do anything in
 * response to receiving this event.
 */

export const clientHeartbeatDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('client.heartbeat'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({}),
  ),
})

export function createClientHeartbeatDTO(): z.infer<typeof clientHeartbeatDtoSchema> {
  return clientHeartbeatDtoSchema.parse({ event: 'client.heartbeat', data: {} })
}
