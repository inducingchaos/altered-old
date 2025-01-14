/**
 *
 */

import { initializeCreateDataFunction, initializeGetDataFunction } from "@sdkit/utils/db/access"
import { accountIndexes, accounts, prohibitedAccountColumns } from "~/server/data/schemas/altered"

export const createAccount = initializeCreateDataFunction({
    for: accounts,
    with: {
        columns: {
            prohibited: prohibitedAccountColumns
        },
        indexes: accountIndexes
    }
})

export const getAccount = initializeGetDataFunction({ for: accounts, selectMany: false })
export const getAccounts = initializeGetDataFunction({ for: accounts, selectMany: true })

export * from "./update"
