import { Client } from '@methadone/client'

import type { JsonValue } from 'type-fest'
import yaml from 'yaml'
import type { CommandModule } from 'yargs'
import { hideBin } from 'yargs/helpers'
import yargsFactory from 'yargs/yargs'

import { command as channelsCommand } from './command/channels.js'
import { command as networkCommand } from './command/networks.js'
import { command as streamCommand } from './command/stream.js'
import { commonOptions, type TextFormatters } from './common-options.js'

const yargsInstance = yargsFactory(hideBin(process.argv))

function formatter(format: string, { plain, text }: TextFormatters): (value: JsonValue) => string {
  switch (format) {
    case 'json':
      return value => JSON.stringify(value, null, 4)
    case 'yaml':
      return value => yaml.stringify(value)
    case 'text':
      return value => text(value)
    case 'plain':
      return value => plain(value)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

yargsInstance
  .wrap(yargsInstance.terminalWidth())
  .scriptName('methadone')
  .options(commonOptions)
  .command([streamCommand, networkCommand, channelsCommand] as CommandModule[])
  .demandCommand()
  .middleware(argv => {
    argv.client = new Client({
      url: argv.url,
      apiKey: argv.apiKey === undefined ? false : argv.apiKey,
    })
    argv.format = (value: JsonValue, textFormatters: TextFormatters): string =>
      formatter(argv.outputFormat, textFormatters)(value)
  })
  .group(['outputFormat', 'url', 'apiKey', 'version', 'help'], 'Global Options')
  .help()
  .strict().argv
