import { type Dayjs } from 'dayjs'

export abstract class ICurrentTimeProvider {
    public abstract now(): Dayjs
}
