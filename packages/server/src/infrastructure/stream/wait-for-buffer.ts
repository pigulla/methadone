import { type Socket } from 'node:net'

export function waitForBuffer(
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
