/**
 *
 */

import { createMysqlTable } from "@sdkit/utils/db/schema"

export const createAlteredMysqlTable = createMysqlTable({
    for: "ALTERED"
})
