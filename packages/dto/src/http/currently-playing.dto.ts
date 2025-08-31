import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const currentlyPlayingDtoSchema = z.object({
  track: z
    .object({
      artist: z.string(),
      title: z.string(),
      startedAt: z.iso.datetime(),
      endsAt: z.iso.datetime(),
    })
    .nullable(),
})

export class CurrentlyPlayingDTO extends createZodDto(currentlyPlayingDtoSchema) {}

export function createCurrentlyPlayingDTO(
  data: {
    artist: string
    title: string
    startedAt: string
    endsAt: string
  } | null,
): CurrentlyPlayingDTO {
  return CurrentlyPlayingDTO.create({
    track: data
      ? {
          artist: data.artist,
          title: data.title,
          startedAt: data.startedAt,
          endsAt: data.endsAt,
        }
      : null,
  })
}
