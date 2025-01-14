/**
 *
 */

// import { AUTH_TOKEN_TTL } from "~/constants/temp"
// import { prohibitedTokenColumns, tokenIndexes, tokens } from "~/server/data/schemas"
// import { generateRandomToken } from "~/utils/auth"
// import { initializeCreateDataFunction, initializeGetDataFunction } from "~/utils/db/access"

// export const getToken = initializeGetDataFunction({ for: tokens, selectMany: false })
// export const getTokens = initializeGetDataFunction({ for: tokens, selectMany: true })

// export const createToken = initializeCreateDataFunction({
//     for: tokens,
//     with: {
//         columns: {
//             prohibited: prohibitedTokenColumns
//         },
//         indexes: tokenIndexes,
//         defaults: {
//             value: async () => await generateRandomToken(),
//             expiresAt: () => new Date(Date.now() + AUTH_TOKEN_TTL)
//         }
//     }
// })

// export * from "./delete"
// export * from "./upsert"
// export * from "./update"
