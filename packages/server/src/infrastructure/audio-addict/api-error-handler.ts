import { HandlerAction, type MapOptions, type Predicate } from 'shumway'
import { type HTTPError } from 'superagent'

import { ObjectValidationError } from '../../util'

import {
    HttpRequestError,
    InvalidResponseError,
    TimeoutError,
    UnexpectedApiError,
} from './audio-addict-api.error'

export function isHttpError(
    code?: number,
): Predicate<unknown[], unknown, Error> {
    return error =>
        'response' in error &&
        (code === undefined ||
            ('statusCode' in error && error.statusCode === code) ||
            ('status' in error && error.status === code))
}

export const DefaultHttpErrorHandler: MapOptions<
    unknown[],
    unknown,
    Error,
    TimeoutError
> = {
    predicate: isHttpError(),
    action: HandlerAction.MAP,
    callback: error => new HttpRequestError(error as HTTPError),
}

export const TimeoutErrorHandler: MapOptions<
    unknown[],
    unknown,
    Error,
    TimeoutError
> = {
    predicate: error => 'response' in error && 'timeout' in error,
    action: HandlerAction.MAP,
    callback: _error => new TimeoutError(),
}

export const ValidationErrorHandler: MapOptions<
    unknown[],
    unknown,
    Error,
    InvalidResponseError
> = {
    scope: ObjectValidationError,
    action: HandlerAction.MAP,
    callback: error => new InvalidResponseError(error as ObjectValidationError),
}

export const FallbackErrorHandler: MapOptions<
    unknown[],
    unknown,
    Error,
    UnexpectedApiError
> = {
    action: HandlerAction.MAP,
    callback: (error: Error) => new UnexpectedApiError(error),
}
