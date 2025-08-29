import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common'
import { execa, type ResultPromise } from 'execa'

import { type IPlayer } from '#application/player.interface.js'
import { IStreamProvider } from '#application/stream-provider.interface.js'

import {
  EXTERNAL_PLAYER_CONFIG,
  type ExternalPlayerConfig,
} from '../config/external-player.config.js'

@Injectable()
export class ExternalPlayer implements IPlayer, OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(ExternalPlayer.name)
  private readonly streamProvider: IStreamProvider
  private readonly config: ExternalPlayerConfig
  private process: ResultPromise | null

  public constructor(
    streamProvider: IStreamProvider,
    @Inject(EXTERNAL_PLAYER_CONFIG) config: ExternalPlayerConfig,
  ) {
    this.streamProvider = streamProvider
    this.config = config
    this.process = null
  }

  public async onApplicationBootstrap(): Promise<void> {
    await this.launch()
  }

  public async onApplicationShutdown(_signal?: string): Promise<void> {
    await this.terminate()
  }

  private async launch(): Promise<void> {
    const { path, options } = this.config

    this.logger.verbose({ path, options }, 'Launching external player')

    await new Promise<void>((resolve, _reject) => {
      this.process = execa(path, options, {
        input: this.streamProvider.stream,
        reject: false,
        killSignal: 'SIGTERM',
        // TODO: Make stdout/stderr available for debugging?
        stdout: 'ignore',
        stderr: 'ignore',
      })

      this.process.once('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        this.process = null
        if (code === 0 || signal === 'SIGTERM') {
          this.logger.debug({ code, signal }, 'External player terminated')
        } else {
          this.logger.warn({ code, signal }, 'External player exited abnormally')
        }
      })
      this.process.once('spawn', () => resolve())
    })

    this.logger.debug({ processId: this.process?.pid }, 'External player launched successfully')
  }

  private terminate(): Promise<void> {
    return new Promise((resolve, _reject) => {
      if (this.process === null) {
        return resolve()
      }

      this.logger.verbose({ processId: this.process.pid }, 'Terminating external player')
      this.process
        .once('exit', (_code: number | null, _signal: NodeJS.Signals | null) => resolve())
        .kill()
    })
  }
}
