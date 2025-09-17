import { Client } from '@digitally-exported/client'

import type { JsonValue } from 'type-fest'
import type { Options } from 'yargs'

export type TextFormatter<T = unknown> = (value: T) => string

export type TextFormatters<T = unknown> = { plain: TextFormatter<T>; text: TextFormatter<T> }

export type CommonOptions<T = unknown> = {
  client: Client
  format: (value: JsonValue, formatter: TextFormatters<T>) => string
}

export const commonOptions = {
  url: {
    type: 'string',
    alias: 'u',
    description: 'The URL of the server',
    demandOption: true,
    requiresArg: true,
    default: 'http://localhost:3000',
  },
  apiKey: {
    type: 'string',
    alias: 'k',
    description: 'The API key for the server',
    demandOption: false,
    requiresArg: true,
  },
  outputFormat: {
    type: 'string',
    choices: ['plain', 'text', 'json', 'yaml'],
    alias: 'f',
    description: 'The output format',
    demandOption: false,
    requiresArg: true,
    default: 'text',
  },
} satisfies Record<string, Options>
