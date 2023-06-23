import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import {
    IsDuration,
    IsNetworkPort,
    MinDuration,
} from 'class-validator-extended'
import { Duration } from 'dayjs/plugin/duration'

import { validate } from '../../util'

export class VlcServerConfig {
    @IsNetworkPort({ allow_system_allocated: false })
    public readonly port: number

    @IsBoolean()
    public readonly useSSL: boolean

    @IsString()
    @IsNotEmpty()
    public readonly hostname: string

    @IsString()
    public readonly username: string

    @IsString()
    public readonly password: string

    @IsDuration()
    @MinDuration([1, 'millisecond'])
    public readonly timeout: Duration

    public constructor(data: {
        port: number
        useSSL: boolean
        hostname: string
        username: string
        password: string
        timeout: Duration
    }) {
        this.port = data.port
        this.useSSL = data.useSSL
        this.hostname = data.hostname
        this.username = data.username
        this.password = data.password
        this.timeout = data.timeout

        validate(this)
    }
}
