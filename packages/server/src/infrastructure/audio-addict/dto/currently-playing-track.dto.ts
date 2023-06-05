import { Expose, instanceToPlain, plainToInstance } from 'class-transformer'
import { IsISO8601, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'
import dayjs from 'dayjs'
import { type JsonObject } from 'type-fest'

import {
    CurrentlyPlayingTrack,
    IsTrackID,
    type TrackID,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

export class CurrentlyPlayingTrackDTO {
    @Expose()
    @IsTrackID()
    public readonly id!: TrackID

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly display_artist!: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    public readonly display_title!: string

    @Expose()
    @IsISO8601({ strict: true })
    public readonly start_time!: string

    @Expose()
    @IsNumber()
    @Min(0)
    public readonly duration!: number

    public static fromJSON(value: JsonObject): CurrentlyPlayingTrackDTO {
        return validate(plainToInstance(CurrentlyPlayingTrackDTO, value), {
            forbidUnknownValues: true,
            forbidNonWhitelisted: true,
        })
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }

    public toDomain(): CurrentlyPlayingTrack {
        return new CurrentlyPlayingTrack({
            ...this,
            artist: this.display_artist,
            title: this.display_title,
            startTime: dayjs(this.start_time),
            duration: dayjs.duration(this.duration, 'seconds'),
        })
    }
}
