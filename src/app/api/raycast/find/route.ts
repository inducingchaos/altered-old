/**
 * Aggregator API route for Raycast to fetch multiple resources in one call
 */

import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { getAllThoughts } from "../../thoughts/route"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { getAiFeatures } from "../../ai/features/route"
import { getAiModels } from "../../ai/models/route"
import { getDatasets } from "../../datasets/route"

export function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get("search") ?? undefined

        const [thoughts, features, models, datasets] = await Promise.all([
            getAllThoughts(query),
            getAiFeatures(),
            getAiModels(),
            getDatasets(query)
        ])

        return NextResponse.json({ thoughts, ai: { features, models }, datasets })
    } catch (error) {
        console.error("Error aggregating resources:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to aggregate resources." }, { status: 500 })
    }
}
