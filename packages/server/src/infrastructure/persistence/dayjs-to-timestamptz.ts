import { type DuckDBTimestampTZValue, timestampTZValue } from '@duckdb/node-api'
import type { Dayjs } from 'dayjs'

export function dayjsToTimestampTZ(value: Dayjs): DuckDBTimestampTZValue {
  return timestampTZValue({
    date: {
      year: value.year(),
      month: value.month(),
      day: value.date(),
    },
    time: {
      hour: value.hour(),
      min: value.minute(),
      sec: value.second(),
      micros: 0,
    },
  })
}
