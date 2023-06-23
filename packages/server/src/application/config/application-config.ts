import { IsInstance } from 'class-validator'

import { validate } from '../../util'

import { VlcServerConfig } from './vlc-server.config'

export class ApplicationConfig {
    @IsInstance(VlcServerConfig)
    public readonly vlc: VlcServerConfig

    public constructor({ vlc }: { vlc: VlcServerConfig }) {
        this.vlc = vlc

        validate(this)
    }
}
