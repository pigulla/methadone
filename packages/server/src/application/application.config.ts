import dayjs from 'dayjs'
import { z } from 'zod'

export const APPLICATION_CONFIG = Symbol('application-config')

export const applicationConfig = z
  .strictObject({
    heartbeatIntervalInSeconds: z
      .number()
      .positive()
      .transform(value => dayjs.duration(value, 'seconds')),
  })
  .transform(value => {
    const { heartbeatIntervalInSeconds, ...others } = value
    return { ...others, heartbeatInterval: heartbeatIntervalInSeconds }
  })
  .readonly()
  .brand('application-config')

export type ApplicationConfig = z.infer<typeof applicationConfig>
