import { connect, type Socket } from 'node:net'
import { PassThrough, type Writable } from 'node:stream'

import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'

import { IStreamManager, type StreamInformation } from '#application/stream-manager.interface.js'
import { AUDIO_FORMAT, type AudioFormat } from '#domain/audio-format.js'
import type { Channel } from '#domain/channel/channel.js'
import type { StreamEvent } from '#domain/event/stream/stream.event.js'
import { StreamStartedEvent } from '#domain/event/stream/stream.started.event.js'
import { StreamTrackEvent } from '#domain/event/stream/stream.track.event.js'
import type { Network } from '#domain/network/network.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { IAudioAddictAPI } from '#infrastructure/audio-addict/api/audio-addict-api.interface.js'

import { AUDIO_ADDICT_CONFIG, type AudioAddictConfig } from '../config/audio-addict.config.js'

import { IIcecastTransformStream } from './icecast-transform-stream.interface.js'

const suffixMap: Readonly<Record<AudioFormat, string>> = {
  [AUDIO_FORMAT.MP3_320]: '_hi',
  [AUDIO_FORMAT.AAC_128]: '',
  [AUDIO_FORMAT.AAC_64]: '_aac',
}

// TODO: Find a better name for this thing.

@Injectable()
export class StreamManager implements IStreamManager, OnModuleDestroy {
  public readonly format: AudioFormat
  public readonly stream: PassThrough

  private readonly logger = new Logger(StreamManager.name)
  private readonly audioAddictApi: IAudioAddictAPI
  private readonly networkRepository: INetworkRepository
  private readonly config: AudioAddictConfig
  private readonly moduleRef: ModuleRef
  private readonly eventEmitter: EventEmitter2

  private active: {
    network: Network
    channel: Channel
    track: string
    socket: Socket
  } | null

  public constructor(
    networkRepository: INetworkRepository,
    @Inject(AUDIO_ADDICT_CONFIG) config: AudioAddictConfig,
    audioAddictApi: IAudioAddictAPI,
    eventEmitter: EventEmitter2,
    moduleRef: ModuleRef,
  ) {
    this.format = config.format
    this.networkRepository = networkRepository
    this.config = config
    this.audioAddictApi = audioAddictApi
    this.eventEmitter = eventEmitter
    this.moduleRef = moduleRef
    this.active = null
    this.stream = new PassThrough()
  }

  public onModuleDestroy(): void {
    this.stop()
  }

  public stop(): void {
    if (this.active === null) {
      return
    }

    this.logger.log('Stopping stream')
    this.active.socket.unpipe()
    this.active.socket.destroy()

    this.active = null
  }

  public getInformation(): StreamInformation | null {
    return this.active
      ? {
          track: this.active.track,
          network: this.active.network,
          channel: this.active.channel,
        }
      : null
  }

  @OnEvent(StreamTrackEvent.NAME)
  public onStreamTrack(event: StreamTrackEvent): void {
    if (this.active) {
      this.active.track = event.track
    }
  }

  private emit(event: StreamEvent): void {
    this.eventEmitter.emit(event.name, event)
  }

  public async start(channel: Channel, destination: Writable = this.stream): Promise<void> {
    const [network, icecastTransformStream] = await Promise.all([
      this.networkRepository.getByID(channel.networkId),
      this.moduleRef.resolve(IIcecastTransformStream),
    ])

    this.stop()

    const { hostname, pathname } = new URL(await this.audioAddictApi.getStreamURL(network, channel))

    // TODO: Don't hardcode the port
    const socket = connect(80, hostname, () => {
      socket.pipe(icecastTransformStream).pipe(destination)
      socket.write(
        [`GET ${pathname}?${this.config.listeningKey} HTTP/1.0`, 'Icy-MetaData:1', '', ''].join(
          '\r\n',
        ),
      )
    })

    this.active = {
      channel,
      network,
      track: '<unknown>',
      socket,
    }

    this.logger.log({ channel: channel.key }, 'Stream started')
    this.emit(new StreamStartedEvent({ network, channel }))
  }
}
