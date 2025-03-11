/**
 *
 */

import { NETWORK_ERROR_STATUSES, NETWORK_SUCCESS_STATUSES } from "@sdkit/constants/api"
import { Exception } from "@sdkit/meta"
import type { NetworkExceptionID } from "@sdkit/meta/exception"
import type { NetworkStatusCode, NetworkStatusName } from "@sdkit/types/api"
import { toTitleCase } from "@sdkit/utils/characters"
import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import config from "~/config"

export function createNetworkResponse<T extends object>(options?: {
    using?: {
        id?: string
        status?: NetworkStatusName | NetworkStatusCode | "success" | "error"
        message?: string
        data?: T
    }
    from?: {
        exception?: Exception<"network", NetworkExceptionID, object>
    }
}): NextResponse {
    const inProduction = process.env.ENVIRONMENT === "production"

    let defaultStatus: string[] | undefined = undefined
    let defaultMessage: string | undefined = undefined

    if (options?.from?.exception) {
        defaultStatus = Object.entries(NETWORK_ERROR_STATUSES).find(status =>
            status.includes(options.from!.exception!.id.toUpperCase().replace(/-/g, "_"))
        )

        console.log("Default status: ", defaultStatus)

        const defaultInfo = {
            external: {
                label: options?.from?.exception?.info?.external?.label ?? Exception.default.info?.external?.label,
                message: options?.from?.exception?.info?.external?.message ?? Exception.default.info?.external?.message
            },
            internal: {
                label: options?.from?.exception?.info?.internal.label ?? Exception.default.info?.internal.label,
                message: options?.from?.exception?.info?.internal.message ?? Exception.default.info?.internal.message
            }
        }

        defaultMessage = `${!inProduction ? defaultInfo.internal.label : defaultInfo.external.label}: ${!inProduction ? defaultInfo.internal.message : defaultInfo.external.message}`
    }

    const {
        status: currentStatus = defaultStatus?.[0] ?? "success",
        message = defaultMessage,
        data = options?.from?.exception?.metadata,
        id = nanoid()
    } = options?.using ?? {}

    const isSuccessStatus =
        currentStatus === "success" ||
        Object.entries(NETWORK_SUCCESS_STATUSES).some(successStatus => successStatus.includes(currentStatus))

    const statuses = isSuccessStatus ? NETWORK_SUCCESS_STATUSES : NETWORK_ERROR_STATUSES
    const [statusCode, statusName] =
        Object.entries(statuses).find(status => status.includes(currentStatus)) ??
        defaultStatus ??
        (isSuccessStatus ? ["200", NETWORK_SUCCESS_STATUSES["200"]] : ["500", NETWORK_ERROR_STATUSES["500"]])

    const defaultStatusMessages = config.localization.network.statusMessages

    const payload = {
        id: id,
        timestamp: new Date().toISOString(),
        success: isSuccessStatus,
        error: !isSuccessStatus ? statusName : undefined,
        message: message ?? defaultStatusMessages[statusCode as keyof typeof defaultStatusMessages],
        data: isSuccessStatus ? data : !inProduction ? data : undefined
    }

    return NextResponse.json(payload, {
        status: parseInt(statusCode!),
        statusText: statusName ? toTitleCase(statusName.replace(/-/g, " ")) : undefined
    })
}
