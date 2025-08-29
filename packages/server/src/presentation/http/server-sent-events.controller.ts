import { clearInterval, setInterval } from 'node:timers'

import { createClientConnectedDTO } from '@methadone/dto/sse/connection/client.connected.dto.js'
import { createClientDisconnectedDTO } from '@methadone/dto/sse/connection/client.disconnected.dto.js'
import { createClientHeartbeatDTO } from '@methadone/dto/sse/connection/client.heartbeat.dto.js'
import type { Event } from '@methadone/dto/sse/event.js'
import { createStreamPlayingDTO } from '@methadone/dto/sse/stream/stream.playing.dto.js'
import { createStreamStartedDTO } from '@methadone/dto/sse/stream/stream.started.dto.js'
import { createStreamStoppedDTO } from '@methadone/dto/sse/stream/stream.stopped.dto.js'
import { createStreamTrackDTO } from '@methadone/dto/sse/stream/stream.track.dto.js'

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
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { type Response } from 'express'
import { nanoid } from 'nanoid'
import { Subject } from 'rxjs'
import type { Tagged } from 'type-fest'

import { APPLICATION_CONFIG, type ApplicationConfig } from '#application/application.config.js'
import { IStreamManager } from '#application/stream-provider.interface.js'
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
  private onStreamStarted({ network, channel }: StreamStartedEvent): void {
    this.broadcast(createStreamStartedDTO({ network, channel }))
  }

  @OnEvent(StreamStoppedEvent.NAME)
  private onStreamStopped(_event: StreamStoppedEvent): void {
    this.broadcast(createStreamStoppedDTO())
  }

  @OnEvent(StreamTrackEvent.NAME)
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
      error: (error: unknown) => {
        this.logger.warn('Papaya?')
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
