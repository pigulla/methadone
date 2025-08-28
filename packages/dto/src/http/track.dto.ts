import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const trackDtoSchema = z.object({
  title: z.string(),
  artist: z.string(),
})

export class TrackDTO extends createZodDto(trackDtoSchema) {}

export function createTrackDTO({ title, artist }: { title: string; artist: string }): TrackDTO {
  return TrackDTO.create({ title, artist })
}
