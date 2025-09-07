import { z } from 'zod'

export const keySchema = z.string().regex(/^[a-z_0-9]+$/)
