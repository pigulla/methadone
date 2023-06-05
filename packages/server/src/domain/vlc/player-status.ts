import { Equals, IsEnum, IsInt, Min } from 'class-validator'

import { validate } from '../../util'
import { type ChannelKey, IsChannelKey } from '../audio-addict'

import { PlayerState } from './player-state'

export abstract class AbstractPlayerStatus {
    @IsInt()
    @Min(0)
    public readonly volume: number

    @IsEnum(PlayerState)
    public abstract readonly state: PlayerState

    protected constructor(data: { volume: number }) {
        this.volume = data.volume
    }
}

export class StoppedStatus extends AbstractPlayerStatus {
    @Equals(PlayerState.STOPPED)
    public override readonly state: PlayerState.STOPPED = PlayerState.STOPPED

    public constructor(data: { volume: number }) {
        super({ ...data })

        validate(this)
    }
}

export class PlayingStatus extends AbstractPlayerStatus {
    @Equals(PlayerState.PLAYING)
    public override readonly state: PlayerState.PLAYING = PlayerState.PLAYING

    @IsChannelKey()
    public readonly channelKey: ChannelKey

    public constructor(data: { volume: number; channelKey: ChannelKey }) {
        super({ ...data })

        this.channelKey = data.channelKey

        validate(this)
    }
}

export type PlayerStatus = PlayingStatus | StoppedStatus
