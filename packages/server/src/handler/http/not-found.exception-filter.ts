import { Catch, type ExceptionFilter, NotFoundException } from '@nestjs/common'
import { type ArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'
import { BaseExceptionFilter } from '@nestjs/core'

import { NotFoundError } from '../../domain/audio-addict/error'

@Catch(NotFoundError)
export class NotFoundExceptionFilter
    extends BaseExceptionFilter
    implements ExceptionFilter<NotFoundError>
{
    public catch(exception: NotFoundError, host: ArgumentsHost): void {
        super.catch(new NotFoundException(exception.message), host)
    }
}
