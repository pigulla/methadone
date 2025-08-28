import { z } from 'zod'

export const streamHeartbeatDtoSchema = z.strictObject({
  event: z.literal('stream.heartbeat'),
})

export function createStreamHeartbeatDTO(): z.infer<typeof streamHeartbeatDtoSchema> {
  return streamHeartbeatDtoSchema.parse({ event: 'stream.heartbeat' })
}
