import { Module } from '@nestjs/common'

import { PlayerModule } from '#module/player.module.js'
import { ChannelController } from '#presentation/http/controller/channel.controller.js'
import { ChannelFilterController } from '#presentation/http/controller/channel-filter.controller.js'
import { CurrentlyPlayingController } from '#presentation/http/controller/currently-playing.controller.js'
import { NetworkController } from '#presentation/http/controller/network.controller.js'
import { ServerSentEventsController } from '#presentation/http/controller/server-sent-events.controller.js'
import { StreamController } from '#presentation/http/controller/stream.controller.js'

import { ApplicationModule } from './application.module.js'

@Module({
  imports: [ApplicationModule, PlayerModule],
  controllers: [
    NetworkController,
    ChannelController,
    ChannelFilterController,
    CurrentlyPlayingController,
    StreamController,
    ServerSentEventsController,
  ],
})
export class ControllerModule {}
