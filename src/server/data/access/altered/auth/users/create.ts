/**
 *
 */

import { initializeCreateDataFunction } from "@sdkit/utils/db/access"
import { prohibitedUserColumns, userIndexes, users } from "~/server/data/schemas/altered"

export const createUser = initializeCreateDataFunction({
    for: users,
    with: { indexes: userIndexes, columns: { prohibited: prohibitedUserColumns } }
})
