import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator'

import { validate } from '../../../util'

export class OnAirTrackDTO {
    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The name of the artist.',
        example: 'Stellardrone',
    })
    @IsString()
    @IsNotEmpty()
    public readonly artist: string

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The title of the track.',
        example: 'The Earth Is Blue (live)',
    })
    @IsString()
    @IsNotEmpty()
    public readonly title: string

    @ApiProperty({
        readOnly: true,
        required: true,
        title: 'The timestamp when the playback started.',
        example: '2023-06-03T15:48:39-04:00',
    })
    @IsISO8601({ strict: true })
    public readonly startedAt: string

    @IsString()
    public readonly duration: string

    public constructor(data: {
        artist: string
        title: string
        startedAt: string
        duration: string
    }) {
        this.artist = data.artist
        this.title = data.title
        this.startedAt = data.startedAt
        this.duration = data.duration

        validate(this)
    }
}
