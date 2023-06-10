import { type Readable } from 'node:stream'

/**
 * Consume data from the given readable stream into the given buffer until the predicate returns true. The predicate
 * function is called whenever data is read from the stream.
 */
export function bufferUntil(
    readable: Readable,
    predicate: (buffer: Buffer) => boolean,
    initial: Buffer = Buffer.alloc(0),
): Promise<Buffer> {
    let buffer = initial

    return new Promise((resolve, reject) => {
        const onError = (error: Error): void => {
            readable.off('error', onError)
            readable.off('data', onData)
            reject(error)
        }
        const onData = (data: Buffer): void => {
            buffer = Buffer.concat([buffer, data])

            if (predicate(buffer)) {
                readable.off('error', onError)
                readable.off('data', onData)
                resolve(buffer)
            }
        }

        readable.once('error', onError)
        readable.on('data', onData)
    })
}
