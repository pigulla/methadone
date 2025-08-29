import { Module } from '@nestjs/common'

import { IPlayer } from '#application/player.interface.js'
import { ExternalPlayer } from '#infrastructure/player/external-player.js'
import { ApplicationModule } from '#module/application.module.js'

import { ConfigModule } from './config.module.js'

@Module({
  imports: [ConfigModule, ApplicationModule],
  providers: [{ provide: IPlayer, useClass: ExternalPlayer }],
  exports: [IPlayer],
})
export class PlayerModule {}
