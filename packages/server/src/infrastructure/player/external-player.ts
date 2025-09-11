import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common'
import { ExecaError, execa, type ResultPromise } from 'execa'

import { type IPlayer } from '#application/player.interface.js'
import { IStreamManager } from '#application/stream-manager.interface.js'

import {
  EXTERNAL_PLAYER_CONFIG,
  type ExternalPlayerConfig,
} from '../config/external-player.config.js'

@Injectable()
export class ExternalPlayer
  implements IPlayer, OnApplicationBootstrap, OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(ExternalPlayer.name)
  private readonly streamManager: IStreamManager
  private readonly config: ExternalPlayerConfig
  private player: { readonly process: ResultPromise; abortController: AbortController } | null

  public constructor(
    streamManager: IStreamManager,
    @Inject(EXTERNAL_PLAYER_CONFIG) config: ExternalPlayerConfig,
  ) {
    this.streamManager = streamManager
    this.config = config
    this.player = null
  }

  public async onModuleInit(): Promise<void> {
    await this.probe()
  }

  public async onApplicationBootstrap(): Promise<void> {
    await this.launch()
  }

  public onApplicationShutdown(_signal?: string): void {
    this.terminate()
  }

  private async probe(): Promise<void> {
    const { path, probeOptions } = this.config

    if (probeOptions === null) {
      return
    }

    try {
      await execa(path, probeOptions, { all: true })
    } catch (error) {
      if (error instanceof ExecaError) {
        this.logger.error({ output: error.all }, 'Failed to probe external player')
        throw new Error('Failed to probe external player')
      }

      throw error
    }
  }

  private async launch(): Promise<void> {
    const { path, options } = this.config

    this.logger.verbose({ path, options }, 'Launching external player')

    await new Promise<void>((resolve, _reject) => {
      const abortController = new AbortController()

      this.player = {
        abortController,
        process: execa(path, options, {
          cancelSignal: abortController.signal,
          input: this.streamManager.getStream(),
          // TODO: Make stdout/stderr available for debugging?
          stdout: 'ignore',
          stderr: 'ignore',
        }),
      }

      abortController.signal.addEventListener(
        'abort',
        () => {
          this.logger.debug('External player terminated')
          this.player = null
        },
        { once: true },
      )

      this.player.process.catch(error => {
        if (!(error instanceof ExecaError) || !error.isCanceled) {
          throw error
        }
      })

      this.player.process.once('spawn', () => resolve())
    })

    this.logger.debug(
      { processId: this.player?.process.pid },
      'External player launched successfully',
    )
  }

  private terminate(): void {
    if (this.player === null) {
      return
    }

    this.logger.verbose({ processId: this.player.process.pid }, 'Terminating external player')
    this.player.abortController.abort()
    this.player = null
  }
}
