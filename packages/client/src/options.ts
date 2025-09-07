import z from 'zod'

export const optionsSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
})

export type Options = z.infer<typeof optionsSchema>
