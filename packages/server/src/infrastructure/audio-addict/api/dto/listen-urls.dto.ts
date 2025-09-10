import { URL } from 'node:url'

import z from 'zod'

export const listenUrlsDtoSchema = z
  .array(z.httpUrl())
  .min(1)
  .refine(value => {
    const { search, hash } = new URL(value)

    // We need to append the listen key to the URL, which is much easier to do if we can assume that the URL doesn't
    // contain any search parameters or a hash.
    // The underlying issue here is that Node's URL module can not be used to add a valueless search parameter (i.e.,
    // just a key without a value _and_ without an equals sign). The AudioAddict stream endpoints require the listen key
    // to be passed like '...?<listenkey>', they won't accept '...?<listenkey>='.
    return search === '' && hash === ''
  })
