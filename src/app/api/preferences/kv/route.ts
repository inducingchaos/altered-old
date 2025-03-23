/**
 * API routes for system key-value preferences
 */
import { eq, and } from "drizzle-orm"
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

// GET all system preferences
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

        // Get all preferences for the system
        const preferences = await db.query.temp.findMany({
            where: eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID)
        })

        // Format the response as {key: string, value: string} pairs
        const formattedPreferences = preferences.map(pref => ({
            key: pref.key,
            value: pref.value
        }))

        return NextResponse.json(formattedPreferences)
    } catch (error) {
        console.error("Error fetching system preferences:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to fetch system preferences." }, { status: 500 })
    }
}

// POST to update system preferences
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        // Parse and validate the request body
        const body = (await request.json()) as Record<string, unknown>

        if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
            return NextResponse.json(
                { error: "Invalid request body. Expected an object with key-value pairs." },
                { status: 400 }
            )
        }

        // Process each key-value pair
        const results: { key: string; value: string }[] = []

        for (const [key, value] of Object.entries(body)) {
            const stringValue = typeof value === "string" ? value : JSON.stringify(value)

            // Upsert the preference
            // First delete any existing value with this key
            await db.delete(temp).where(and(eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID), eq(temp.key, key)))

            // Then insert the new value
            await db.insert(temp).values({
                thoughtId: SYSTEM_PREFERENCES_THOUGHT_ID,
                key,
                value: stringValue
            })

            results.push({ key, value: stringValue })
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error("Error updating system preferences:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to update system preferences." }, { status: 500 })
    }
}
