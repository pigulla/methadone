import { spawn } from 'node:child_process'
import { connect } from 'node:net'

import { type PinoLogger } from 'nestjs-pino'

import { TitleTransformStream } from './title-transform-stream'

// See https://stackoverflow.com/questions/4911062/pulling-track-info-from-an-audio-stream-using-php/4914538#4914538

export type StreamOptions = {
    logger: PinoLogger
    host: string
    port: number
    path: string
    onTrackChange: (track: string) => void
}

export type CloseFn = () => Promise<void>

export function openShoutcastStream({
    host,
    port,
    path,
    onTrackChange,
    logger,
}: StreamOptions): CloseFn {
    const titleStream = new TitleTransformStream(logger)

    // const vlc = spawn(
    //     '/opt/homebrew/bin/vlc',
    //     [
    //         '--prefetch-buffer-size=16777216',
    //         '--prefetch-read-size=16777216',
    //         '-',
    //     ],
    //     {},
    // )

    titleStream.on('data', (title: string) => {
        console.info(`[Title] ${title}`)
    })

    const socket = connect(port, host, () => {
        logger.trace('Socket connected')

        //socket.pipe(titleStream)
        // socket.pipe(vlc.stdin)

        socket.on('close', () => logger.trace('Socket closed'))

        socket.write(
            [`GET ${path} HTTP/1.0`, 'Icy-MetaData:1', '', ''].join('\n'),
        )

        //        void processStream(socket, onTrackChange)
    })

    return () =>
        new Promise(resolve => {
            socket.once('end', () => resolve())
            socket.destroy()
        })
}
