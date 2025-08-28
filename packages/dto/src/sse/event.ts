import { z } from 'zod'

import { clientConnectedDtoSchema } from './connection/client.connected.dto.js'
import { clientDisconnectedDtoSchema } from './connection/client.disconnected.dto.js'
import { clientHeartbeatDtoSchema } from './connection/client.heartbeat.dto.js'
import { streamPlayingDtoSchema } from './stream/stream.playing.dto.js'
import { streamStartedDtoSchema } from './stream/stream.started.dto.js'
import { streamStoppedDtoSchema } from './stream/stream.stopped.dto.js'
import { streamTrackDtoSchema } from './stream/stream.track.dto.js'

export const eventSchema = z.discriminatedUnion('event', [
  clientConnectedDtoSchema,
  clientDisconnectedDtoSchema,
  clientHeartbeatDtoSchema,
  streamPlayingDtoSchema,
  streamStartedDtoSchema,
  streamStoppedDtoSchema,
  streamTrackDtoSchema,
])

export type Event = z.infer<typeof eventSchema>
