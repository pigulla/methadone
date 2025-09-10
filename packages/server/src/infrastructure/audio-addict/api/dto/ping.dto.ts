import z from 'zod'

export const pingDtoSchema = z.looseObject({
  api_version: z.string(),
})
