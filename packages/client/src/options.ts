import z from 'zod'

export const optionsSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
  apiKey: z.union([
    z.literal(false),
    z
      .string()
      .min(8)
      .max(32)
      .regex(/^[a-f0-9]+$/),
  ]),
})

export type Options = z.infer<typeof optionsSchema>
