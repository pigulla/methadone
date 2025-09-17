import { clearInterval, setInterval } from 'node:timers'

import {
  createClientConnectedDTO,
  createClientDisconnectedDTO,
  createClientHeartbeatDTO,
  createStreamPlayingDTO,
  createStreamStartedDTO,
  createStreamStoppedDTO,
  createStreamTrackDTO,
  type Event,
} from '@digitally-exported/dto'

import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  Res,
  UseGuards,
} from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ApiOperation, ApiProduces, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { type Response } from 'express'
import { nanoid } from 'nanoid'
import { Subject } from 'rxjs'
import type { Tagged } from 'type-fest'

import { APPLICATION_CONFIG, type ApplicationConfig } from '#application/application.config.js'
import { IStreamManager } from '#application/stream-manager.interface.js'
import { StreamStartedEvent } from '#domain/event/stream/stream.started.event.js'
import { StreamStoppedEvent } from '#domain/event/stream/stream.stopped.event.js'
import { StreamTrackEvent } from '#domain/event/stream/stream.track.event.js'
import { ApiKeyGuard } from '#presentation/http/api-key.guard.js'

type ClientID = Tagged<string, 'client-id'>
type ClientConnection = { close: () => void; subject: Subject<Event> }

function generateClientId(): ClientID {
  return nanoid() as ClientID
}

// See https://github.com/nestjs/nest/issues/12670

@Controller('sse')
@UseGuards(ApiKeyGuard)
@ApiTags('sse')
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
export class ServerSentEventsController implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ServerSentEventsController.name)
  private readonly clients: Map<ClientID, ClientConnection>
  private readonly streamProvider: IStreamManager
  private readonly config: ApplicationConfig
  private heartbeatIntervalId: NodeJS.Timeout | null

  public constructor(
    streamProvider: IStreamManager,
    @Inject(APPLICATION_CONFIG) config: ApplicationConfig,
  ) {
    this.streamProvider = streamProvider
    this.config = config
    this.clients = new Map<ClientID, ClientConnection>()
    this.heartbeatIntervalId = null
  }

  public onApplicationBootstrap(): void {
    if (this.heartbeatIntervalId === null) {
      this.heartbeatIntervalId = setInterval(
        () => this.sendHeartbeat(),
        this.config.heartbeatInterval.asMilliseconds(),
      )
    }
  }

  public onModuleDestroy(): void {
    if (this.heartbeatIntervalId !== null) {
      this.logger.verbose('Stopping heartbeat')
      clearInterval(this.heartbeatIntervalId)
      this.heartbeatIntervalId = null
    }

    this.logger.debug('Closing all client connections')
    for (const [clientId, { close, subject }] of this.clients.entries()) {
      subject.next(createClientDisconnectedDTO({ clientId }))
      close()
    }
  }

  private onClientConnected(clientId: ClientID): void {
    this.send(
      clientId,
      createClientConnectedDTO({
        clientId,
        heartbeatIntervalInSeconds: this.config.heartbeatInterval.asSeconds(),
      }),
    )

    const info = this.streamProvider.getInformation()

    if (info) {
      this.send(clientId, createStreamPlayingDTO({ network: info.network, channel: info.channel }))
      this.send(clientId, createStreamTrackDTO({ track: info.track }))
    }
  }

  private onClientDisconnected(clientId: ClientID): void {
    this.send(clientId, createClientDisconnectedDTO({ clientId }))
  }

  @OnEvent(StreamStartedEvent.NAME)
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Event listener callback
  private onStreamStarted({ network, channel }: StreamStartedEvent): void {
    this.broadcast(createStreamStartedDTO({ network, channel }))
  }

  @OnEvent(StreamStoppedEvent.NAME)
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Event listener callback
  private onStreamStopped(_event: StreamStoppedEvent): void {
    this.broadcast(createStreamStoppedDTO())
  }

  @OnEvent(StreamTrackEvent.NAME)
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Event listener callback
  private onStreamNewTrack({ track }: StreamTrackEvent): void {
    this.broadcast(createStreamTrackDTO({ track }))
  }

  private sendHeartbeat(): void {
    this.logger.verbose(`Sending heartbeat to ${this.clients.size} client(s)`)
    this.broadcast(createClientHeartbeatDTO())
  }

  @Get()
  @ApiOperation({
    summary: 'Subscribe to update notifications.',
    description: 'Subscribe to update notifications via server-sent events.',
  })
  @ApiProduces('text/event-stream')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The operation completed successfully.',
    schema: { type: 'string' },
  })
  public sse(@Res() response: Response): void {
    const clientId = generateClientId()
    const subject = new Subject<Event>()
    const observer = {
      next: ({ event, data }: Event) => {
        response.write(`event: ${event}\n`)
        response.write(`data: ${JSON.stringify(data)}\n\n`)
      },
      complete: () => {
        this.logger.debug({ clientId }, 'Client disconnected')
      },
    }

    subject.subscribe(observer)

    this.logger.debug({ clientId }, 'Client connected')
    this.clients.set(clientId, {
      close: () => response.end(),
      subject,
    })

    response.on('close', () => {
      this.onClientDisconnected(clientId)

      subject.complete()
      this.clients.delete(clientId)
      response.end()
    })

    response
      .set({
        connection: 'keep-alive',
        'cache-control': 'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
        'content-type': 'text/event-stream',
      })
      .flushHeaders()

    this.onClientConnected(clientId)
  }

  private send(clientId: ClientID, event: Event): void {
    const client = this.clients.get(clientId)

    if (!client) {
      throw new Error('Client not connected')
    }

    client.subject.next(event)
  }

  private broadcast(event: Event): void {
    for (const { subject } of this.clients.values()) {
      subject.next(event)
    }
  }
}
