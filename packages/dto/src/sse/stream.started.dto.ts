import { z } from 'zod'

export const streamStartedDtoSchema = z.strictObject({
  event: z.literal('stream.started'),
})

export function createStreamStartedDTO(): z.infer<typeof streamStartedDtoSchema> {
  return streamStartedDtoSchema.parse({ event: 'stream.started' })
}
