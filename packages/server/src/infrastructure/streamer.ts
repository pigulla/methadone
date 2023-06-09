import { connect, type Socket } from 'node:net'

import { type PinoLogger } from 'nestjs-pino'

const META_MULTIPLIER = 16
const MAX_META_SIZE_BYTES = 255 * META_MULTIPLIER
const META_INTERVAL_HEADER = 'icy-metaint'
const END_OF_HEADERS = '\r\n\r\n'

function waitForBuffer(
    socket: Socket,
    predicate: (buffer: Buffer) => boolean,
    initial: Buffer = Buffer.alloc(0),
): Promise<Buffer> {
    let buffer = initial

    return new Promise((resolve, reject) => {
        const onError = (error: Error): void => {
            socket.off('error', onError)
            socket.off('data', onData)
            reject(error)
        }
        const onData = (data: Buffer): void => {
            buffer = Buffer.concat([buffer, data])

            if (predicate(buffer)) {
                socket.off('error', onError)
                socket.off('data', onData)
                resolve(buffer)
            }
        }

        socket.once('error', onError)
        socket.on('data', onData)
    })
}

function getTitleFromMetadata(metadata: string): string {
    const string = trimTrailingZeroBytes(metadata)
    const matches = /^StreamTitle='(.*)';$/.exec(string)

    if (!matches) {
        throw new Error(`Failed to parse meta data: ${string}`)
    }

    return matches[1]
}

function getMetaIntervalFromHeaders(header: string): number {
    const headers = parseHeaders(header)

    if (!(META_INTERVAL_HEADER in headers)) {
        throw new Error('Missing header')
    }
    if (typeof headers[META_INTERVAL_HEADER] !== 'string') {
        throw new Error('Invalid header')
    }
    if (!/^\d+$/.test(headers[META_INTERVAL_HEADER])) {
        throw new Error('Invalid header')
    }

    return parseInt(headers[META_INTERVAL_HEADER], 10)
}

function trimTrailingZeroBytes(string: string): string {
    let end = string.length

    while (end > 0 && string[end - 1] === '\x00') {
        --end
    }

    return end < string.length ? string.substring(0, end) : string
}

function parseHeaders(headers: string): Record<string, string | string[]> {
    function trim(string: string): string {
        return string.replace(/^\s+|\s+$/g, '')
    }

    if (!headers) {
        return {}
    }

    const result: Record<string, string | string[]> = {}

    for (const row of trim(headers).split('\n')) {
        const index = row.indexOf(':')
        const key = trim(row.slice(0, index)).toLowerCase()
        const value = trim(row.slice(index + 1))

        if (result[key] === undefined) {
            result[key] = value
        } else if (Array.isArray(result[key])) {
            ;(result[key] as string[]).push(value)
        } else {
            result[key] = [result[key] as string, value]
        }
    }

    return result
}

function processHeaderChunk(headerChunk: Buffer): {
    metaDataIntervalBytes: number
    content: Buffer
} {
    const index = headerChunk.indexOf(END_OF_HEADERS)
    const header = Buffer.copyBytesFrom(headerChunk, 0, index)
    const interval = getMetaIntervalFromHeaders(header.toString())

    return {
        metaDataIntervalBytes: interval,
        content: headerChunk.subarray(
            index + Buffer.byteLength(END_OF_HEADERS),
        ),
    }
}

export type StreamOptions = {
    logger: PinoLogger
    host: string
    port: number
    path: string
    onTrackChange: (title: string) => void
}

async function run(
    socket: Socket,
    onTrackChange: (track: string) => void,
): Promise<never> {
    const headerChunk = await waitForBuffer(socket, buffer =>
        buffer.includes(END_OF_HEADERS),
    )
    const { metaDataIntervalBytes, content } = processHeaderChunk(headerChunk)

    let buffer = content

    // eslint-disable-next-line no-constant-condition
    while (true) {
        buffer = await waitForBuffer(
            socket,
            buffer =>
                buffer.length > metaDataIntervalBytes + 1 + MAX_META_SIZE_BYTES,
            buffer,
        )

        const metaDataLength = buffer[metaDataIntervalBytes] * META_MULTIPLIER
        if (metaDataLength > 0) {
            const raw = buffer
                .subarray(
                    metaDataIntervalBytes + 1,
                    metaDataIntervalBytes + 1 + metaDataLength,
                )
                .toString('utf-8')

            onTrackChange(getTitleFromMetadata(raw))
        }

        buffer = buffer.subarray(metaDataIntervalBytes + 1 + metaDataLength)
    }
}

export type StopFn = () => Promise<void>

export function openStream({
    host,
    port,
    path,
    onTrackChange,
    logger,
}: StreamOptions): StopFn {
    const socket = connect(port, host, () => {
        logger.trace('Socket connected')

        socket.on('close', () => logger.trace('Socket closed'))

        socket.write(
            [`GET ${path} HTTP/1.0`, 'Icy-MetaData:1', '', ''].join('\n'),
        )

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        run(socket, onTrackChange)
    })

    return () =>
        new Promise(resolve =>
            socket.end(() => {
                logger.trace('Closing socket')
                resolve()
            }),
        )
}
