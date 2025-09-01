import {
  createStreamInformationDTO,
  StreamInformationDTO,
} from '@methadone/dto/http/stream-information.dto.js'

import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod'

import { IChannelService } from '#application/channel.service.interface.js'
import { IStreamManager } from '#application/stream-manager.interface.js'
import { AUDIO_FORMAT, type AudioFormat } from '#domain/audio-format.js'
import type { ChannelKey } from '#domain/channel/channel.js'
import { channelKeySchema } from '#domain/channel/channel.schema.js'
import type { NetworkKey } from '#domain/network/network.js'
import { networkKeySchema } from '#domain/network/network.schema.js'
import { ApiKeyGuard } from '#presentation/http/api-key.guard.js'

const audioFormatMap: Readonly<Record<AudioFormat, string>> = {
  [AUDIO_FORMAT.MP3_320]: 'audio/mpeg',
  [AUDIO_FORMAT.AAC_128]: 'audio/aac',
  [AUDIO_FORMAT.AAC_64]: 'audio/aac',
}

@Controller('stream')
@UseGuards(ApiKeyGuard)
@ApiTags('stream')
@ApiSecurity('api-key')
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description:
    'A query or route parameter, the payload or a header was malformed and did not pass validation.',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'No suitable API key was provided by the client.',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'An unexpected error occurred.',
})
export class StreamController {
  private readonly channelService: IChannelService
  private readonly streamManager: IStreamManager

  public constructor(channelService: IChannelService, streamManager: IStreamManager) {
    this.channelService = channelService
    this.streamManager = streamManager
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Stop playback.',
    description:
      'Stop playback of the current stream (if any). Note that a client may continue playing until its local buffer is empty.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The operation completed successfully.',
  })
  public stop(): void {
    this.streamManager.stop()
  }

  @Get()
  @ApiOperation({
    summary: 'Get track being streamed.',
    description: 'Get the track currently being streamed.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: StreamInformationDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No channel is currently being streamed.',
  })
  public onAir() {
    const information = this.streamManager.getInformation()

    if (!information) {
      throw new NotFoundException('No channel is currently being streamed')
    }

    return createStreamInformationDTO(information)
  }

  @Get(':networkKey/:channelKey')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiParam({ name: 'channelKey', type: 'string', example: 'trance' })
  @ApiOperation({
    summary: 'Start streaming a channel.',
    description:
      'Start playback of the channel of the given network with the given key. The stream is the raw audio without any IceCast metadata. Any previously started stream is terminated.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The operation completed successfully.',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network or channel with the given key was not found.',
  })
  public async stream(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
    @Param('channelKey', new ZodValidationPipe(channelKeySchema))
    channelKey: ChannelKey,
    @Res() response: Response,
  ): Promise<void> {
    response.set('content-type', audioFormatMap[this.streamManager.format])
    const channel = await this.channelService.get(networkKey, channelKey)
    await this.streamManager.start(channel, response)
  }

  @Post(':networkKey/:channelKey')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiParam({ name: 'channelKey', type: 'string', example: 'trance' })
  @ApiOperation({
    summary: 'Start streaming a channel to the external player.',
    description:
      'Start playback of the channel of the given network with the given key on the configured external player. The stream is the raw audio without any IceCast metadata. Any previously started stream is terminated.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'The operation completed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network or channel with the given key was not found.',
  })
  public async launchExternalPlayer(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
    @Param('channelKey', new ZodValidationPipe(channelKeySchema))
    channelKey: ChannelKey,
  ): Promise<void> {
    const channel = await this.channelService.get(networkKey, channelKey)
    await this.streamManager.start(channel)
  }
}
