import { z } from 'zod'

export const streamTrackDtoSchema = z.strictObject({
  event: z.literal('stream.track'),
  track: z.string(),
})

export function createStreamTrackDTO({
  track,
}: {
  track: string
}): z.infer<typeof streamTrackDtoSchema> {
  return streamTrackDtoSchema.parse({ event: 'stream.track', track })
}
