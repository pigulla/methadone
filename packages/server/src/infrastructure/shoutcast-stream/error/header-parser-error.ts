import { StreamError } from './stream-error'

export enum Reason {
    MISSING_HEADER = 'missing header',
    DUPLICATE_HEADER = 'duplicate header',
    INVALID_HEADER = 'invalid header',
    MALFORMED_HEADER = 'malformed header',
}

export class HeaderParserError extends StreamError {
    public readonly reason: Reason

    public constructor(reason: Reason) {
        super(`Failed to parse header: ${reason}`)

        this.reason = reason
    }
}
