import { z } from 'zod'

import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted when a client has successfully connected to the server.
 *
 * The client id returned from the server currently has no specific purpose but may be used in future versions.
 */

export const clientConnectedDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('client.connected'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({
      clientId: z.string().min(1),
      heartbeatIntervalInSeconds: z.number().int().positive(),
    }),
  ),
})

export function createClientConnectedDTO(data: {
  clientId: string
  heartbeatIntervalInSeconds: number
}): z.infer<typeof clientConnectedDtoSchema> {
  return clientConnectedDtoSchema.parse({ event: 'client.connected', data })
}
