/**
 *
 */

import { createPgTable } from "@sdkit/utils/db/schema"

// export const createAlteredMysqlTable = createMysqlTable({
//     for: "ALTERED"
// })

export const createAlteredPgTable = createPgTable({
    for: "ALTERED"
})
