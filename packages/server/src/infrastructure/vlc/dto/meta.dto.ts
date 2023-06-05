import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { Optional } from 'class-validator-extended'

import { type ChannelKey } from '../../../domain/audio-addict'

const filenameRegex = /^([a-z]+)(?:_hi)?\?[a-z0-9]{16}$/

export class MetaDTO {
    @Expose()
    @Optional()
    @IsString()
    @IsNotEmpty()
    public readonly title?: string

    @Expose()
    @Matches(filenameRegex)
    public readonly filename!: string

    @Expose()
    @Optional()
    @IsString()
    @IsNotEmpty()
    public readonly genre?: string

    @Expose()
    @Optional()
    @IsString()
    @IsNotEmpty()
    public readonly now_playing?: string

    public get channelKey(): ChannelKey {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [, channelKey] = filenameRegex.exec(this.filename)!

        return channelKey as ChannelKey
    }
}
