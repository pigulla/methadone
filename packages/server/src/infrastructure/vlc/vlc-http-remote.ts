import { Injectable } from '@nestjs/common'
import superagent, { type SuperAgentStatic } from 'superagent'
import { type JsonObject } from 'type-fest'

import { VlcServerConfig } from '../../application/config'
import {
    type IVlcRemote,
    PlayerState,
    type PlayerStatus,
    PlayingStatus,
    StoppedStatus,
} from '../../domain/vlc'

import { StatusDTO } from './dto'

@Injectable()
export class VlcHttpRemote implements IVlcRemote {
    private readonly config: VlcServerConfig
    private readonly client: SuperAgentStatic

    public constructor(config: VlcServerConfig) {
        this.config = config
        this.client = superagent
            .agent()
            .auth(config.username, config.password)
            .retry(0)
            .timeout({ deadline: config.timeout.asMilliseconds() })
    }

    private async executeCommand(
        command?: string,
        parameters?: Record<string, string | number>,
    ): Promise<PlayerStatus> {
        const response = await this.client
            .get(
                `http${this.config.useSSL ? 's' : ''}://${
                    this.config.hostname
                }:${this.config.port}/requests/status.json`,
            )
            .query({
                command,
                ...parameters,
            })

        return this.parseResponse(response.text)
    }

    private parseResponse(body: string): PlayerStatus {
        let json: JsonObject

        try {
            json = JSON.parse(body) as JsonObject
        } catch (error) {
            throw new Error('Failed to parse JSON')
        }

        const dto = StatusDTO.fromJSON(json)

        switch (dto.state) {
        case PlayerState.STOPPED:
            return new StoppedStatus({ volume: dto.volume })
        case PlayerState.PLAYING:
            return new PlayingStatus({
                volume: dto.volume,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                channelKey: dto.information!.category.meta.channelKey,
            })
        default:
            throw new Error(`Unexpected state`)
        }
    }

    public async stop(): Promise<PlayerStatus> {
        return this.executeCommand('pl_stop')
    }

    public async play(url: string): Promise<PlayerStatus> {
        return this.executeCommand('in_play', { input: url })
    }

    public async clearPlaylist(): Promise<PlayerStatus> {
        return this.executeCommand('pl_empty')
    }

    public async getStatus(): Promise<PlayerStatus> {
        return this.executeCommand()
    }
}
