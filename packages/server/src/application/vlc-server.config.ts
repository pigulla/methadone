import { IsString, IsUrl } from 'class-validator'
import { IsDuration, MinDuration } from 'class-validator-extended'
import { Duration } from 'dayjs/plugin/duration'

import { validate } from '../util'

export class VlcServerConfig {
    @IsUrl({
        protocols: ['http', 'https'],
        require_protocol: true,
        require_tld: false,
    })
    public readonly url: string

    @IsString()
    public readonly username: string

    @IsString()
    public readonly password: string

    @IsDuration()
    @MinDuration([1, 'millisecond'])
    public readonly timeout: Duration

    public constructor(data: {
        url: string
        username: string
        password: string
        timeout: Duration
    }) {
        this.url = data.url
        this.username = data.username
        this.password = data.password
        this.timeout = data.timeout

        validate(this)
    }
}
