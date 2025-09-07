import z from 'zod'
import {networkIdSchema, channelIdSchema, channelKeySchema} from "@methadone/types";
 
export const channelSchema = z
  .strictObject({
    id: channelIdSchema,
    key: channelKeySchema,
    networkId: networkIdSchema,
    name: z.string().min(1),
    director: z.string(),
    description: z.string(),
    similar: z.set(channelIdSchema).readonly(),
  })
  .brand('channel')
