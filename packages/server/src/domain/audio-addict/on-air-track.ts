import { IsInstance, IsNotEmpty, IsString } from 'class-validator'
import { IsDayjs, IsDuration, MinDuration } from 'class-validator-extended'
import { Dayjs } from 'dayjs'
import { Duration } from 'dayjs/plugin/duration'

import { validate } from '../../util'

import { Artist } from './artist'
import { TrackID } from './track'
import { IsTrackID } from './validators'

export class OnAirTrack {
    @IsTrackID()
    public readonly id: TrackID

    @IsInstance(Artist)
    public readonly artist: Artist

    @IsString()
    @IsNotEmpty()
    public readonly title: string

    @IsDayjs()
    public readonly startedAt: Dayjs

    @IsDuration()
    @MinDuration([0, 'seconds'])
    public readonly duration: Duration

    public constructor(data: {
        id: TrackID
        artist: Artist
        title: string
        startedAt: Dayjs
        duration: Duration
    }) {
        this.id = data.id
        this.artist = data.artist
        this.title = data.title
        this.startedAt = data.startedAt
        this.duration = data.duration

        validate(this)
    }
}
