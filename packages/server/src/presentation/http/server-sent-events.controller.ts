import { setInterval } from 'node:timers'

import {
  Controller,
  Get,
  Inject,
  Logger,
  type MessageEvent,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  Res,
} from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { type Response } from 'express'
import { nanoid } from 'nanoid'
import { Subject } from 'rxjs'
import type { Tagged } from 'type-fest'

import { APPLICATION_CONFIG, type ApplicationConfig } from '#application/application.config.js'
import { StreamEvent } from '#domain/event/stream/stream.event-name.js'
import type { StreamNewTrackEvent } from '#domain/event/stream/stream.new-track.event.js'
import type { StreamStartedEvent } from '#domain/event/stream/stream.started.event.js'
import type { StreamStoppedEvent } from '#domain/event/stream/stream.stopped.event.js'

type ClientID = Tagged<string, 'client-id'>
type ClientConnection = { close: () => void; subject: Subject<MessageEvent> }

function generateClientId(): ClientID {
  return nanoid() as ClientID
}

// See https://github.com/nestjs/nest/issues/12670

@Controller('stream/sse')
export class ServerSentEventsController implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ServerSentEventsController.name)
  private readonly clients: Map<ClientID, ClientConnection>
  private readonly config: ApplicationConfig
  private heartbeatIntervalId: NodeJS.Timeout | null

  public constructor(@Inject(APPLICATION_CONFIG) config: ApplicationConfig) {
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
    this.logger.log('Closing all client connections')
    for (const { close, subject } of this.clients.values()) {
      subject.next({ type: 'bye', data: {} })
      close()
    }
  }

  @OnEvent(StreamEvent.STARTED)
  public onStreamStarted(event: StreamStartedEvent): void {
    this.broadcast({ type: 'stream.started', data: {} })
  }

  @OnEvent(StreamEvent.STOPPED)
  public onStreamStopped(_event: StreamStoppedEvent): void {
    this.broadcast({ type: 'stream.stopped', data: {} })
  }

  @OnEvent(StreamEvent.NEW_TRACK)
  public onStreamNewTrack(event: StreamNewTrackEvent): void {
    this.broadcast({ type: 'stream.new-track', data: { track: event.track } })
  }

  private sendHeartbeat(): void {
    this.logger.debug(`Sending heartbeat to ${this.clients.size} client(s)`)
    this.broadcast({
      type: 'heartbeat',
      data: {},
    })
  }

  @Get()
  public sse(@Res() response: Response): void {
    const clientId = generateClientId()
    const subject = new Subject<MessageEvent>()
    const observer = {
      next: ({ id, type, data, retry }: MessageEvent) => {
        if (typeof type === 'string') {
          response.write(`event: ${type}\n`)
        }
        if (typeof id === 'string') {
          response.write(`id: ${id}\n`)
        }
        if (typeof retry === 'number') {
          response.write(`retry: ${retry}\n`)
        }

        response.write(`data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`)
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

    this.send(clientId, {
      type: 'hello',
      data: { clientId, heartbeatIntervalInSeconds: this.config.heartbeatInterval.asSeconds() },
    })
  }

  private send(clientId: ClientID, message: MessageEvent): void {
    const client = this.clients.get(clientId)

    if (!client) {
      throw new Error('Client not connected')
    }

    client.subject.next(message)
  }

  private broadcast(message: MessageEvent): void {
    for (const { subject } of this.clients.values()) {
      subject.next(message)
    }
  }
}
