import { Expose } from 'class-transformer'
import { Equals, IsString } from 'class-validator'

export class AudioStreamDTO {
    @Expose()
    @Equals('Audio')
    public readonly Type!: string

    @Expose()
    @IsString()
    public readonly Bitrate!: string

    @Expose()
    @IsString()
    public readonly Codec!: string

    @Expose()
    @IsString()
    public readonly Channels!: string

    @Expose()
    @IsString()
    public readonly Sample_rate!: string
}
