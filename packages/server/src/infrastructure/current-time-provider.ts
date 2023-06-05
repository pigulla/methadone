import dayjs, { type Dayjs } from 'dayjs'

import { type ICurrentTimeProvider } from '../application'

export class CurrentTimeProvider implements ICurrentTimeProvider {
    public now(): Dayjs {
        return dayjs()
    }
}
