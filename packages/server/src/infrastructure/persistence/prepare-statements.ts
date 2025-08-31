import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { SnakeCase } from 'type-fest'

export type PreparedStatements<T extends readonly string[]> = {
  [k in T[number] as Uppercase<SnakeCase<k>>]: string
}

export async function prepareStatements<T extends readonly string[]>(
  directory: string,
  files: T,
): Promise<PreparedStatements<T>> {
  const entries = await Promise.all(
    files.map(
      async name =>
        [
          name.toUpperCase().replaceAll('-', '_'),
          await readFile(join(directory, `${name}.sql`), 'utf8').then(buffer => buffer.toString()),
        ] as const,
    ),
  )

  return Object.fromEntries(entries) as PreparedStatements<T>
}
