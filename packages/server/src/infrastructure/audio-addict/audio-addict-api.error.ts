import type { HTTPError } from 'superagent'
import { CustomError } from 'ts-custom-error'

import { type ObjectValidationError } from '../../util'

export abstract class AudioAddictApiError extends CustomError {}

export class TimeoutError extends AudioAddictApiError {
    public constructor() {
        super('Request timed out')
    }
}

export class UnexpectedApiError extends AudioAddictApiError {
    public readonly cause: Error

    public constructor(cause: Error) {
        super('An unexpected error occurred')

        this.cause = cause
    }
}

export class ResponseParsingError extends AudioAddictApiError {
    public readonly cause: Error | null

    public constructor(message: string, cause: Error | null = null) {
        super(`Error parsing response: ${message}`)

        this.cause = cause
    }
}

export class InvalidResponseError extends AudioAddictApiError {
    public readonly cause: ObjectValidationError

    public constructor(cause: ObjectValidationError) {
        super(`Invalid response received`)

        this.cause = cause
    }
}

export class HttpRequestError extends AudioAddictApiError {
    public readonly cause: HTTPError

    public constructor(cause: HTTPError) {
        super('An HTTP error occurred')

        this.cause = cause
    }
}

export class MissingETagError extends AudioAddictApiError {
    public constructor() {
        super('Missing ETag')
    }
}
