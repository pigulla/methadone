import { z } from 'zod'

import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted when the server disconnects a client (i.e., because it is shutting down). It is not sent if
 * the client has initiated the disconnect.
 *
 * The client id returned from the server currently has no specific purpose but may be used in future versions.
 */

export const clientDisconnectedDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('client.disconnected'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({
      clientId: z.string().min(1),
    }),
  ),
})

export function createClientDisconnectedDTO(data: {
  clientId: string
}): z.infer<typeof clientDisconnectedDtoSchema> {
  return clientDisconnectedDtoSchema.parse({ event: 'client.disconnected', data })
}
