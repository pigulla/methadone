import { z } from 'zod'

import { streamHeartbeatDtoSchema } from './stream.heartbeat.dto.js'
import { streamStartedDtoSchema } from './stream.started.dto.js'
import { streamStoppedDtoSchema } from './stream.stopped.dto.js'
import { streamTrackDtoSchema } from './stream.track.dto.js'

export const streamEventSchema = z.discriminatedUnion('event', [
  streamHeartbeatDtoSchema,
  streamStartedDtoSchema,
  streamStoppedDtoSchema,
  streamTrackDtoSchema,
])
