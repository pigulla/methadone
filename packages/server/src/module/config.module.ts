import { Global, Module } from '@nestjs/common'
import config from 'config'
import dayjs from 'dayjs'

import { ApplicationConfig, VlcServerConfig } from '../application/config'

@Global()
@Module({
    providers: [
        {
            provide: VlcServerConfig,
            useValue: new VlcServerConfig({
                port: config.get(`vlc.port`),
                useSSL: config.get(`vlc.useSSL`),
                hostname: config.get(`vlc.hostname`),
                username: config.get(`vlc.username`),
                password: config.get(`vlc.password`),
                timeout: dayjs.duration(
                    config.get(`vlc.timeoutInMilliseconds`),
                    'milliseconds',
                ),
            }),
        },
        {
            provide: ApplicationConfig,
            inject: [VlcServerConfig],
            useFactory(vlc: VlcServerConfig): ApplicationConfig {
                return new ApplicationConfig({ vlc })
            },
        },
    ],
    exports: [ApplicationConfig, VlcServerConfig],
})
export class ConfigModule {}
