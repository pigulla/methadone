import { z } from 'zod'

export const streamStoppedDtoSchema = z.strictObject({
  event: z.literal('stream.stopped'),
})

export function createStreamStoppedDTO(): z.infer<typeof streamStoppedDtoSchema> {
  return streamStoppedDtoSchema.parse({ event: 'stream.stopped' })
}
