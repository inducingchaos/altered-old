/**
 *
 */

import { createPgTable } from "@sdkit/utils/db/schema"

// export const createIiinputMysqlTable = createMysqlTable({
//     for: "iiinput"
// })

export const createIiinputPgTable = createPgTable({
    for: "iiinput"
})
