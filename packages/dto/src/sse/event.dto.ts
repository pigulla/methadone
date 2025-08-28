import { z } from 'zod'

export const serverSentEventDtoSchema = z.object({
  id: z.string().optional(),
  event: z.string().optional(),
  retry: z.number().optional(),
  data: z.string(),
})
