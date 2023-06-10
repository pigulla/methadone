import { connect } from 'node:net'

import { type PinoLogger } from 'nestjs-pino'

import { processStream } from './process-stream'

export type StreamOptions = {
    logger: PinoLogger
    host: string
    port: number
    path: string
    onTrackChange: (title: string) => void
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
        processStream(socket, onTrackChange)
    })

    return () =>
        new Promise(resolve =>
            socket.end(() => {
                logger.trace('Closing socket')
                resolve()
            }),
        )
}
