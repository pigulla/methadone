import { type IncomingHttpHeaders } from 'http'

import { parseHeaders } from './parse-headers'

export const HEADER_BODY_SEPARATOR = '\r\n\r\n'

export function processHeaderChunk(headerChunk: Buffer): {
    headers: IncomingHttpHeaders
    body: Buffer
} {
    const index = headerChunk.indexOf(HEADER_BODY_SEPARATOR)
    const header = Buffer.copyBytesFrom(headerChunk, 0, index)

    return {
        headers: parseHeaders(header.toString()),
        body: headerChunk.subarray(
            index + Buffer.byteLength(HEADER_BODY_SEPARATOR),
        ),
    }
}
