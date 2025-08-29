import { Module } from '@nestjs/common'

import { PlayerModule } from '#module/player.module.js'
import { NetworkController } from '#presentation/http/network.controller.js'
import { ServerSentEventsController } from '#presentation/http/server-sent-events.controller.js'
import { StreamController } from '#presentation/http/stream.controller.js'

import { ApplicationModule } from './application.module.js'

@Module({
  imports: [ApplicationModule, PlayerModule],
  controllers: [NetworkController, StreamController, ServerSentEventsController],
})
export class ControllerModule {}
