import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { ClsModule } from 'nestjs-cls'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'

import { IDatabase } from '#infrastructure/persistence/database.interface.js'
import { TransactionalAdapterPglite } from '#infrastructure/persistence/transactional-adapter-pglite.js'
import { ApplicationModule } from '#module/application.module.js'
import { ControllerModule } from '#module/controller.module.js'

import { ConfigModule } from './config.module.js'
import { DatabaseModule } from './database.module.js'
import { LoggingModule } from './logging.module.js'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPglite({
            dbInstanceToken: IDatabase,
          }),
        }),
      ],
    }),
    ConfigModule,
    LoggingModule,
    ControllerModule,
    ApplicationModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class MainModule {}
