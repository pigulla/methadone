import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const trackDtoSchema = z.strictObject({
  title: z.string(),
  artist: z.string(),
})

export function createTrackDTO(data: {
  title: string
  artist: string
}): z.infer<typeof trackDtoSchema> {
  return trackDtoSchema.parse(data)
}

export class TrackDTO extends createZodDto(trackDtoSchema) {}
