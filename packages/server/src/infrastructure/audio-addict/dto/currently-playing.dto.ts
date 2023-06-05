import {
    Expose,
    instanceToPlain,
    plainToInstance,
    Type,
} from 'class-transformer'
import { IsInstance } from 'class-validator'
import { Nullable } from 'class-validator-extended'
import { type JsonObject } from 'type-fest'

import {
    ChannelID,
    ChannelKey,
    IsChannelID,
    IsChannelKey,
} from '../../../domain/audio-addict'
import { validate } from '../../../util'

import { CurrentlyPlayingTrackDTO } from './currently-playing-track.dto'

export class CurrentlyPlayingDTO {
    @Expose()
    @IsChannelID()
    public readonly channel_id!: ChannelID

    @Expose()
    @IsChannelKey()
    public readonly channel_key!: ChannelKey

    @Nullable()
    @Type(() => CurrentlyPlayingTrackDTO)
    @IsInstance(CurrentlyPlayingTrackDTO)
    public readonly track!: CurrentlyPlayingTrackDTO | null

    public static fromJSON(value: JsonObject): CurrentlyPlayingDTO {
        return validate(plainToInstance(CurrentlyPlayingDTO, value))
    }

    public toJSON(): JsonObject {
        return instanceToPlain(this)
    }
}
