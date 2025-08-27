import z from 'zod'

export const trackSchema = z.strictObject({
  artist: z.string(),
  title: z.string(),
})
