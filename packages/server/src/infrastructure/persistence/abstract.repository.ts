import type { OnModuleInit } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'

import { TransactionalAdapterPglite } from '#infrastructure/persistence/transactional-adapter-pglite.js'

import { type PreparedStatements, prepareStatements } from './prepare-statements.js'

export abstract class AbstractRepository<T extends string[]> implements OnModuleInit {
  protected readonly txHost: TransactionHost<TransactionalAdapterPglite>

  private readonly directory: string
  private readonly fileNames: readonly string[]
  private statements: PreparedStatements<T> | null

  protected constructor(
    txHost: TransactionHost<TransactionalAdapterPglite>,
    { directory, fileNames }: { directory: string; fileNames: T },
  ) {
    this.txHost = txHost
    this.directory = directory
    this.fileNames = [...fileNames]
    this.statements = null
  }

  public async onModuleInit(): Promise<void> {
    this.statements = await prepareStatements(this.directory, this.fileNames)
  }

  protected get stmt(): PreparedStatements<T> {
    if (this.statements === null) {
      throw new Error('Not initialized')
    }

    return this.statements
  }
}
