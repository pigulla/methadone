import z from 'zod'

export const playlistEntrySchema = z
  .strictObject({
    file: z.httpUrl(),
    length: z.number().int().min(-1).nullable(),
    title: z.string().nullable(),
  })
  .readonly()
  .brand('playlist-entry')

export type PlaylistEntry = z.infer<typeof playlistEntrySchema>
