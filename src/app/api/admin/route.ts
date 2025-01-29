/**
 *
 */

import { createNetworkResponse } from "@sdkit/utils/network"
import type { NextRequest, NextResponse } from "next/server"
import { pushNotification } from "~/lib/comms/notifications/pwa"

export const adminCommandIds = ["push-notification"] as const

export function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    if (!isAuthedSimple(request)) {
        return createNetworkResponse({
            using: {
                status: "UNAUTHORIZED",
                message: "Failed To Run Command: Invalid authorization header."
            }
        })
    }

    const { command, data } = (await request.json()) as { command: string; data: unknown }

    switch (command) {
        case "push-notification":
            const { title, message, userId, url } = data as { title?: string; message?: string; userId?: string; url?: string }

            // if (!title || !message) {
            //     return createNetworkResponse({
            //         using: {
            //             status: "error",
            //             message: "Missing title or message"
            //         }
            //     })
            // }

            const sendResults = await pushNotification({
                with: {
                    title,
                    message,
                    url
                },
                to: { userId }
            })

            return createNetworkResponse({
                using: {
                    status: "success",
                    message: `The push notification${sendResults.length > 1 ? "s" : ""} has been sent.`
                }
            })
        default:
            return createNetworkResponse({
                using: {
                    status: "BAD_REQUEST",
                    message: "Unable to Perform Task: Invalid command ID."
                }
            })
    }
}
