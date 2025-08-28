import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const currentlyPlayingDtoSchema = z.strictObject({
  track: z
    .strictObject({
      artist: z.string(),
      title: z.string(),
      startedAt: z.iso.datetime(),
      duration: z.number().int().min(0),
    })
    .nullable(),
})

export class CurrentlyPlayingDTO extends createZodDto(currentlyPlayingDtoSchema) {}

export function createCurrentlyPlayingDTO(
  data: {
    artist: string
    title: string
    startedAt: string
    duration: number
  } | null,
): CurrentlyPlayingDTO {
  return CurrentlyPlayingDTO.create({
    track: data
      ? {
          artist: data.artist,
          title: data.title,
          startedAt: data.startedAt,
          duration: data.duration,
        }
      : null,
  })
}
