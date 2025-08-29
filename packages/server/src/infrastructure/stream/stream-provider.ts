import { connect } from 'node:net'
import type { Writable } from 'node:stream'

import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'

import { IStreamProvider } from '#application/stream-provider.interface.js'
import { AUDIO_FORMAT, type AudioFormat } from '#domain/audio-format.js'
import type { Channel } from '#domain/channel/channel.js'
import type { StreamEvent } from '#domain/event/stream/stream.event.js'
import { StreamStartedEvent } from '#domain/event/stream/stream.started.event.js'
import { StreamStoppedEvent } from '#domain/event/stream/stream.stopped.event.js'
import { StreamTrackEvent } from '#domain/event/stream/stream.track.event.js'
import type { Network } from '#domain/network/network.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'

import { AUDIO_ADDICT_CONFIG, type AudioAddictConfig } from '../config/audio-addict.config.js'

import { IIcecastTransformStream } from './icecast-transform-stream.interface.js'

const suffixMap: Readonly<Record<AudioFormat, string>> = {
  [AUDIO_FORMAT.MP3_320]: '_hi',
  [AUDIO_FORMAT.AAC_128]: '',
  [AUDIO_FORMAT.AAC_64]: '_aac',
}

@Injectable()
export class StreamProvider implements IStreamProvider, OnModuleDestroy {
  private readonly logger = new Logger(StreamProvider.name)
  private readonly networkRepository: INetworkRepository
  private readonly config: AudioAddictConfig
  private readonly moduleRef: ModuleRef
  private readonly eventEmitter: EventEmitter2
  private active: {
    network: Network
    channel: Channel
    stream: Writable
    track: string
  } | null

  public constructor(
    networkRepository: INetworkRepository,
    @Inject(AUDIO_ADDICT_CONFIG) config: AudioAddictConfig,
    eventEmitter: EventEmitter2,
    moduleRef: ModuleRef,
  ) {
    this.networkRepository = networkRepository
    this.config = config
    this.eventEmitter = eventEmitter
    this.moduleRef = moduleRef
    this.active = null
  }

  public onModuleDestroy(): void {
    this.stop()
  }

  public stop(): void {
    if (this.active === null || this.active.stream.closed || this.active.stream.destroyed) {
      return
    }

    this.logger.log('Closing stream')
    this.active.stream.destroy()
  }

  public getInformation(): { track: string; network: Network; channel: Channel } | null {
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

  public async streamTo(channel: Channel, stream: Writable): Promise<void> {
    const path = `/${channel.key}${suffixMap[this.config.format]}?${this.config.listeningKey}`
    const [network, icecastTransformStream] = await Promise.all([
      this.networkRepository.getByID(channel.networkId),
      this.moduleRef.resolve(IIcecastTransformStream),
    ])

    this.stop()
    this.active = {
      channel,
      network,
      track: '<unknown>',
      stream: stream.once('close', () => {
        this.logger.verbose('Stream closed')
        this.emit(new StreamStoppedEvent())
        this.active = null
      }),
    }

    this.logger.log({ channel: channel.key }, 'Starting stream')
    this.emit(new StreamStartedEvent({ network, channel }))

    // TODO: Get host/port from PLS file?
    const socket = connect(80, 'prem2.di.fm', () => {
      socket.pipe(icecastTransformStream).pipe(stream)
      socket.write([`GET ${path} HTTP/1.0`, 'Icy-MetaData:1', '', ''].join('\r\n'))
    })
  }
}
