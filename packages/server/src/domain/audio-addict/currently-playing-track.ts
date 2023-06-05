import { IsNotEmpty, IsString } from 'class-validator'
import { IsDayjs, IsDuration, MinDuration } from 'class-validator-extended'
import { type Dayjs } from 'dayjs'
import { type Duration } from 'dayjs/plugin/duration'

import { validate } from '../../util'

import { type TrackID } from './track'
import { IsTrackID } from './validators'

export class CurrentlyPlayingTrack {
    @IsTrackID()
    public readonly id: TrackID

    @IsString()
    @IsNotEmpty()
    public readonly artist: string

    @IsString()
    @IsNotEmpty()
    public readonly title: string

    @IsDayjs()
    public readonly startTime: Dayjs

    @IsDuration()
    @MinDuration([0, 'seconds'])
    public readonly duration: Duration

    public constructor(data: {
        id: TrackID
        artist: string
        title: string
        startTime: Dayjs
        duration: Duration
    }) {
        this.id = data.id
        this.artist = data.artist
        this.title = data.title
        this.startTime = data.startTime
        this.duration = data.duration

        validate(this)
    }

    public equals(other: unknown): other is CurrentlyPlayingTrack {
        return other instanceof CurrentlyPlayingTrack && this.id === other.id
    }
}
