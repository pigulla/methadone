import { z } from 'zod'

import { channelDtoSchema, createChannelDTO } from '../../http/channel.dto.js'
import { createNetworkDTO, networkDtoSchema } from '../../http/network.dto.js'
import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted when the server has started streaming.
 *
 * A "stream.track" event will be emitted immediately after this event.
 */

export const streamStartedDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('stream.started'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({
      network: networkDtoSchema,
      channel: channelDtoSchema,
    }),
  ),
})

export function createStreamStartedDTO(data: {
  network: Parameters<typeof createNetworkDTO>[0]
  channel: Parameters<typeof createChannelDTO>[0]
}): z.infer<typeof streamStartedDtoSchema> {
  return streamStartedDtoSchema.parse({ event: 'stream.started', data })
}
