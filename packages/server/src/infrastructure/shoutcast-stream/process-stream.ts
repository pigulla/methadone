import { type Socket } from 'node:net'

import { bufferUntil } from './buffer-until'
import { getMetaIntervalFromHeaders } from './get-metainterval-from-headers'
import { getTitleFromMetadata } from './get-title-from-metadata'
import {
    HEADER_BODY_SEPARATOR,
    processHeaderChunk,
} from './process-header-chunk'

const META_MULTIPLIER = 16
const MAX_META_SIZE_BYTES = 255 * META_MULTIPLIER

export async function processStream(
    socket: Socket,
    onTrackChange: (track: string) => void,
): Promise<never> {
    const headerChunk = await bufferUntil(socket, buffer =>
        buffer.includes(HEADER_BODY_SEPARATOR),
    )
    const { headers, body } = processHeaderChunk(headerChunk)
    const metaDataIntervalBytes = getMetaIntervalFromHeaders(headers)

    let buffer = body

    // eslint-disable-next-line no-constant-condition
    while (true) {
        buffer = await bufferUntil(
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
                .toString()

            onTrackChange(getTitleFromMetadata(raw))
        }

        buffer = buffer.subarray(metaDataIntervalBytes + 1 + metaDataLength)
    }
}
