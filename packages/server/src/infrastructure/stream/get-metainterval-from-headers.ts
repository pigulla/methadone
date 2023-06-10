import { type IncomingHttpHeaders } from 'http'

import { HeaderParserError, Reason } from './error'

const META_INTERVAL_HEADER = 'icy-metaint'

export function getMetaIntervalFromHeaders(
    headers: IncomingHttpHeaders,
): number {
    if (headers[META_INTERVAL_HEADER] === undefined) {
        throw new HeaderParserError(Reason.MISSING_HEADER)
    }
    if (Array.isArray(headers[META_INTERVAL_HEADER])) {
        throw new HeaderParserError(Reason.DUPLICATE_HEADER)
    }
    if (!/^\d+$/.test(headers[META_INTERVAL_HEADER])) {
        throw new HeaderParserError(Reason.INVALID_HEADER)
    }

    return parseInt(headers[META_INTERVAL_HEADER], 10)
}
