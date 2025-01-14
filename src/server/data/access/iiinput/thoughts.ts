/**
 *
 */

import { initializeCreateDataFunction, initializeGetDataFunction } from "@sdkit/utils/db/access"
import { thoughts, prohibitedThoughtColumns, thoughtIndexes } from "~/server/data/schemas/iiinput"

export const createThought = initializeCreateDataFunction({
    for: thoughts,
    with: {
        columns: {
            prohibited: prohibitedThoughtColumns
        },
        indexes: thoughtIndexes
    }
})

export const getThought = initializeGetDataFunction({ for: thoughts, selectMany: false })
export const getThoughts = initializeGetDataFunction({ for: thoughts, selectMany: true })
