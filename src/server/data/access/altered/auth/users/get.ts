/**
 *
 */

import { initializeGetDataFunction } from "@sdkit/utils/db/access"
import { users } from "~/server/data/schemas/altered"

export const getUser = initializeGetDataFunction({ for: users, selectMany: false })
export const getUsers = initializeGetDataFunction({ for: users, selectMany: true })
