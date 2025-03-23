/**
 * API routes for individual system key-value preferences
 */
import { and, eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import { SYSTEM_PREFERENCES_THOUGHT_ID } from "~/server/config/preferences"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

type Params = {
    params: Promise<{
        id: string
    }>
}

// GET a specific preference by key
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
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
            return NextResponse.json({ error: "Preference key is required" }, { status: 400 })
        }

        // Get the preference with the specified key
        const preference = await db.query.temp.findFirst({
            where: and(eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID), eq(temp.key, id))
        })

        if (!preference) {
            return NextResponse.json({ error: `Preference with key '${id}' not found` }, { status: 404 })
        }

        // Return the preference in the requested format
        return NextResponse.json({
            key: preference.key,
            value: preference.value
        })
    } catch (error) {
        const { id } = await params
        console.error(`Error fetching preference with key ${id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to fetch preference." }, { status: 500 })
    }
}

// PUT to update a specific preference
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
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
            return NextResponse.json({ error: "Preference key is required" }, { status: 400 })
        }

        // Parse and validate the request body
        const body = (await request.json()) as unknown

        if (body === null || body === undefined) {
            return NextResponse.json({ error: "Request body is required" }, { status: 400 })
        }

        const stringValue = typeof body === "string" ? body : JSON.stringify(body)

        // Upsert the preference
        // First delete any existing value with this key
        await db.delete(temp).where(and(eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID), eq(temp.key, id)))

        // Then insert the new value
        await db.insert(temp).values({
            thoughtId: SYSTEM_PREFERENCES_THOUGHT_ID,
            key: id,
            value: stringValue
        })

        return NextResponse.json({
            key: id,
            value: stringValue
        })
    } catch (error) {
        const { id } = await params
        console.error(`Error updating preference with key ${id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to update preference." }, { status: 500 })
    }
}

// DELETE a specific preference
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
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
            return NextResponse.json({ error: "Preference key is required" }, { status: 400 })
        }

        // Check if the preference exists before deleting
        const preference = await db.query.temp.findFirst({
            where: and(eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID), eq(temp.key, id))
        })

        if (!preference) {
            return NextResponse.json({ error: `Preference with key '${id}' not found` }, { status: 404 })
        }

        // Delete the preference with the specified key
        await db.delete(temp).where(and(eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID), eq(temp.key, id)))

        return NextResponse.json({ success: true, message: `Preference with key '${id}' deleted` })
    } catch (error) {
        const { id } = await params
        console.error(`Error deleting preference with key ${id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to delete preference." }, { status: 500 })
    }
}
