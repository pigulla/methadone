import { MetadataParserError } from './error'
import { trimTrailingZeroBytes } from './trim-trailing-zero-bytes'

export function getTitleFromMetadata(metadata: string): string {
    const string = trimTrailingZeroBytes(metadata)
    const matches = /^StreamTitle='(.*)';$/.exec(string)

    if (!matches) {
        throw new MetadataParserError(`Stream title not found`)
    }

    return matches[1]
}
