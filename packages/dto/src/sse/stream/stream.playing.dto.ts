import { z } from 'zod'

import { channelDtoSchema, createChannelDTO } from '../../http/channel.dto.js'
import { createNetworkDTO, networkDtoSchema } from '../../http/network.dto.js'
import { serverSentEventDtoSchema } from '../event.dto.js'

/**
 * This event is emitted after a client connects when the server is currently streaming.
 *
 * A "stream.track" event will be emitted immediately after this event.
 */

export const streamPlayingDtoSchema = serverSentEventDtoSchema.extend({
  event: z.literal('stream.playing'),
  data: z.preprocess(
    value => (typeof value === 'string' ? JSON.parse(value) : value),
    z.object({
      network: networkDtoSchema,
      channel: channelDtoSchema,
    }),
  ),
})

export function createStreamPlayingDTO(data: {
  network: Parameters<typeof createNetworkDTO>[0]
  channel: Parameters<typeof createChannelDTO>[0]
}): z.infer<typeof streamPlayingDtoSchema> {
  return streamPlayingDtoSchema.parse({ event: 'stream.playing', data })
}
