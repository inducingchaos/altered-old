/**
 * @remarks
 * - Make sure to mark all exception IDs with `as const`, otherwise the type inference will not work.
 */

import type { networkStatuses } from "@sdkit/constants/api"
import type { NetworkStatusCode } from "@sdkit/types/api"
import type { ArrayToUnion } from "@sdkit/utils/types"

export const logicExceptionIds = ["incorrect-usage", "unknown"] as const
export const configExceptionIds = ["missing-environment-variable", "missing-value"] as const
export const authExceptionIds = [
    "invalid-credentials",
    "expired-token",
    "unauthorized",
    "unauthenticated",
    "expired-session"
] as const
export const dataExceptionIds = [
    "duplicate-identifier",
    "resource-not-found",
    "violated-constraint",
    "invalid-data",
    "unknown"
] as const
export const commsExceptionIds = ["send-failed"] as const
export const frameworkExceptionIds = ["hook-outside-provider"] as const

export type NetworkExceptionID = {
    [K in NetworkStatusCode]: K extends `4${string}` | `5${string}` ? (typeof networkStatuses)[K] : never
}[NetworkStatusCode]
export type LogicExceptionID = ArrayToUnion<typeof logicExceptionIds>
export type ConfigExceptionID = ArrayToUnion<typeof configExceptionIds>
export type AuthExceptionID = ArrayToUnion<typeof authExceptionIds>
export type DataExceptionID = ArrayToUnion<typeof dataExceptionIds>
export type CommsExceptionID = ArrayToUnion<typeof commsExceptionIds>
export type FrameworkExceptionID = ArrayToUnion<typeof frameworkExceptionIds>

export type ExceptionID = {
    network: NetworkExceptionID
    logic: LogicExceptionID
    config: ConfigExceptionID
    auth: AuthExceptionID
    data: DataExceptionID
    comms: CommsExceptionID
    framework: FrameworkExceptionID
}
