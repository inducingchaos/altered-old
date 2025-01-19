/**
 * @remarks
 * - Make sure to mark all exception IDs with `as const`, otherwise the type inference will not work.
 */

import type { NETWORK_ERROR_STATUSES } from "@sdkit/constants/api"
import type { NetworkErrorStatusCode } from "@sdkit/types/api"
import type { ArrayToUnion, Replace } from "@sdkit/utils/types"

export const logicExceptionIds = ["incorrect-usage", "unhandled-edge-case", "unknown"] as const
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
    [Key in NetworkErrorStatusCode]: Lowercase<Replace<(typeof NETWORK_ERROR_STATUSES)[Key], "_", "-">>
}[NetworkErrorStatusCode]
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
