import z from 'zod'

export const listenUrlsDtoSchema = z.array(z.httpUrl()).min(1)
