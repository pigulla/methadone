import z from 'zod'

export const optionsSchema = z.object({
  url: z.httpUrl(),
})

export type Options = z.infer<typeof optionsSchema>
