import { eq, and } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

const SORTING_KEY = "dataset-sorting"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: "Dataset ID is required." }, { status: 400 })
        }

        // Check if dataset exists
        const dataset = await db.query.temp.findFirst({
            where: and(eq(temp.id, id), eq(temp.key, "dataset_title"))
        })

        if (!dataset) {
            return NextResponse.json({ error: "Dataset not found." }, { status: 404 })
        }

        // Get sorting order
        const sortingOrder = await db.query.temp.findFirst({
            where: and(eq(temp.thoughtId, id), eq(temp.key, SORTING_KEY))
        })

        if (!sortingOrder) {
            return NextResponse.json({ error: "No custom sort order found." }, { status: 404 })
        }

        const thoughtIds = JSON.parse(sortingOrder.value) as string[]
        return NextResponse.json({
            thoughtIds,
            updatedAt: sortingOrder.updatedAt
        })
    } catch (error) {
        console.error("Error getting dataset sort order:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to get dataset sort order." }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: "Dataset ID is required." }, { status: 400 })
        }

        // Check if dataset exists
        const dataset = await db.query.temp.findFirst({
            where: and(eq(temp.id, id), eq(temp.key, "dataset_title"))
        })

        if (!dataset) {
            return NextResponse.json({ error: "Dataset not found." }, { status: 404 })
        }

        // Validate request body
        const body = (await request.json()) as { thoughtIds: string[] }
        const { thoughtIds } = body

        if (!Array.isArray(thoughtIds)) {
            return NextResponse.json({ error: "Invalid thoughtIds array." }, { status: 400 })
        }

        // Check if sorting order exists
        const existingSortingOrder = await db.query.temp.findFirst({
            where: and(eq(temp.thoughtId, id), eq(temp.key, SORTING_KEY))
        })

        if (existingSortingOrder) {
            // Update existing sort order
            await db
                .update(temp)
                .set({
                    value: JSON.stringify(thoughtIds)
                })
                .where(and(eq(temp.thoughtId, id), eq(temp.key, SORTING_KEY)))
        } else {
            // Create new sort order
            await db.insert(temp).values({
                thoughtId: id,
                key: SORTING_KEY,
                value: JSON.stringify(thoughtIds)
            })
        }

        return NextResponse.json({
            thoughtIds,
            updatedAt: new Date()
        })
    } catch (error) {
        console.error("Error updating dataset sort order:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to update dataset sort order." }, { status: 500 })
    }
}
