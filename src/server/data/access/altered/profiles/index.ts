/**
 *
 */

import { initializeCreateDataFunction, initializeGetDataFunction } from "@sdkit/utils/db/access"
import { profileIndexes, profiles, prohibitedProfileColumns } from "~/server/data/schemas/altered"

export const getProfile = initializeGetDataFunction({ for: profiles, selectMany: false })
export const getProfiles = initializeGetDataFunction({ for: profiles, selectMany: true })

export const createProfile = initializeCreateDataFunction({
    for: profiles,
    with: {
        columns: {
            prohibited: prohibitedProfileColumns
        },
        indexes: profileIndexes
    }
})

export * from "./update"
