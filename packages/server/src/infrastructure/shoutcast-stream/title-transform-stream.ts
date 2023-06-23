import { Transform, type TransformCallback } from 'node:stream'

import { type PinoLogger } from 'nestjs-pino'

// See https://stackoverflow.com/questions/4911062/pulling-track-info-from-an-audio-stream-using-php/4914538#4914538

const HEADER_BODY_SEPARATOR = '\r\n\r\n'
const META_INTERVAL_HEADER = 'icy-metaint'
const META_SIZE_FIELD_WIDTH = 1
const META_SIZE_MULTIPLIER = 16
const MAX_META_SIZE_BYTES =
    Math.pow(256, META_SIZE_FIELD_WIDTH) * META_SIZE_MULTIPLIER

export class TitleTransformStream extends Transform {
    private metaDataIntervalBytes: number
    private headersReceived: boolean
    private buffer: Buffer
    private logger: PinoLogger

    public constructor(logger: PinoLogger) {
        super()

        this.logger = logger
        this.metaDataIntervalBytes = Infinity
        this.headersReceived = false
        this.buffer = Buffer.allocUnsafe(0)
    }

    private getMetaIntervalFromHeaders(headers: string[]): number {
        const metaIntHeader = headers
            .map<[string, number]>(header => [header, header.indexOf(':')])
            .filter(([, index]) => index !== -1)
            .map(
                ([header, index]) =>
                    [
                        header.substring(0, index).toLowerCase(),
                        header.substring(index + 1).trim(),
                    ] as const,
            )
            .find(([key, _value]) => key === META_INTERVAL_HEADER)

        if (!metaIntHeader || !metaIntHeader[1].match(/^\d+$/)) {
            throw new Error(
                `Header '${META_INTERVAL_HEADER}' is missing or has an invalid value`,
            )
        }

        return parseInt(metaIntHeader[1], 10)
    }

    private processBufferAsHeaderChunk(): void {
        const index = this.buffer.indexOf(HEADER_BODY_SEPARATOR)

        if (index === -1) {
            return
        }

        const header = Buffer.copyBytesFrom(this.buffer, 0, index).toString()
        const [, ...headers] = header.split('\r\n')

        this.buffer = this.buffer.subarray(
            index + Buffer.byteLength(HEADER_BODY_SEPARATOR),
        )

        this.metaDataIntervalBytes = this.getMetaIntervalFromHeaders(headers)
        this.headersReceived = true

        this.logger.info(
            `Metadata expected every ${this.metaDataIntervalBytes} bytes`,
        )
    }

    private getTitleFromMetadata(metadata: string): string {
        const string = metadata.replace(/\0*$/, '')
        const matches = /^StreamTitle='(.*)';$/.exec(string)

        if (!matches) {
            throw new Error(`Stream title not found`)
        }

        return matches[1]
    }

    private processBuffer(): string | undefined {
        const metaDataLength =
            this.buffer[this.metaDataIntervalBytes] * META_SIZE_MULTIPLIER
        let result: string | undefined

        if (metaDataLength === 0) {
            this.logger.trace('Metadata is empty')
        } else {
            const raw = this.buffer
                .subarray(
                    this.metaDataIntervalBytes + META_SIZE_FIELD_WIDTH,
                    this.metaDataIntervalBytes +
                        META_SIZE_FIELD_WIDTH +
                        metaDataLength,
                )
                .toString()

            result = this.getTitleFromMetadata(raw)
            this.logger.info(`New title in metadata received: ${result}`)
        }

        this.buffer = this.buffer.subarray(
            this.metaDataIntervalBytes + META_SIZE_FIELD_WIDTH + metaDataLength,
        )

        return result
    }

    /**
     * Return true iff enough data is buffered so that it must contain both the metadata size field and the metadata
     * itself.
     */
    private isBufferReady(): boolean {
        return (
            this.buffer.length >=
            this.metaDataIntervalBytes +
                META_SIZE_FIELD_WIDTH +
                MAX_META_SIZE_BYTES
        )
    }

    public override _transform(
        chunk: Buffer,
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        this.logger.trace(`${chunk.length} byte(s) received`)
        this.buffer = Buffer.concat([this.buffer, chunk])

        try {
            if (!this.headersReceived) {
                this.processBufferAsHeaderChunk()
                callback()
            } else if (this.isBufferReady()) {
                callback(null, this.processBuffer())
            } else {
                callback()
            }
        } catch (error) {
            callback(error as Error)
        }
    }
}
