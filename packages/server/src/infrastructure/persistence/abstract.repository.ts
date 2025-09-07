import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import type { TransactionalAdapterKysely } from '@nestjs-cls/transactional-adapter-kysely'

import type { DatabaseType } from '#infrastructure/persistence/types.js'

@Injectable()
export abstract class AbstractRepository {
  protected readonly txHost: TransactionHost<TransactionalAdapterKysely<DatabaseType>>

  protected constructor(txHost: TransactionHost<TransactionalAdapterKysely<DatabaseType>>) {
    this.txHost = txHost
  }
}
