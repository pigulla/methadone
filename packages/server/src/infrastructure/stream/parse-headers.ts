import { type IncomingHttpHeaders } from 'node:http'

import { HeaderParserError, Reason } from './error'

export function parseHeaders(headers: string): IncomingHttpHeaders {
    const value = headers.trim()
    const result: IncomingHttpHeaders = {}

    if (value.length === 0) {
        return result
    }

    const rows = value.split('\n')

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]

        if (i === 0 && row.startsWith('HTTP')) {
            continue
        }

        const index = row.indexOf(':')

        if (index === -1) {
            throw new HeaderParserError(Reason.MALFORMED_HEADER)
        }

        const key = row.slice(0, index).trim().toLowerCase()
        const value = row.slice(index + 1).trim()
        const previous = result[key]

        if (previous === undefined) {
            result[key] = value
        } else if (typeof previous === 'string') {
            result[key] = [previous, value]
        } else {
            previous.push(value)
        }
    }

    return result
}
