/**
 * API routes for thoughts with ID
 */

// spell-checker: disable

import { eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts, type Thought } from "~/server/data/schemas/iiinput"
import { ensureThoughtAlias } from "~/server/utils/alias-generator"
import { setTempValue } from "~/server/utils/alias-manager"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    console.error("Received request with auth header:", authHeader, "Expected:", `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`)

    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

// Valid fields that can be updated directly in the thoughts table
// const UPDATABLE_THOUGHT_FIELDS = ["content"] as const

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

        const { id: thoughtId } = await params

        if (!thoughtId) {
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    }
                }
            })
        }

        // Get thought by ID
        const thoughtResult = await db.query.thoughts.findFirst({
            where: eq(thoughts.id, thoughtId),
            with: {
                tempValues: true
            }
        })

        if (!thoughtResult) {
            return NextResponse.json({ error: "Thought not found." }, { status: 404 })
        }

        // Create response object with all temp values at the top level
        const response = {
            ...Object.fromEntries(Object.entries(thoughtResult).filter(([key]) => key !== "tempValues")),
            ...Object.fromEntries(thoughtResult.tempValues.map(tv => [tv.key, tv.value]))
        } as Thought & Record<string, string>

        // Ensure alias exists
        if (!response.alias) {
            const withAlias = await ensureThoughtAlias(response)
            if (withAlias.alias) {
                response.alias = withAlias.alias
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        if (error instanceof Exception) {
            return createNetworkResponse({ from: { exception: error as unknown as Exception<"network", NetworkExceptionID> } })
        }

        return NextResponse.json({ error: "Failed to fetch thought." }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id: thoughtId } = await params

        console.log("Deleting thought: ", thoughtId)

        if (!thoughtId) {
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    }
                }
            })
        }

        // Delete the thought with the specified ID
        const result = await db.delete(thoughts).where(eq(thoughts.id, thoughtId))

        // Check if any rows were affected
        if (!result || result.rowsAffected === 0) {
            return NextResponse.json({ message: "Thought not found or already deleted." }, { status: 404 })
        }

        return NextResponse.json({
            message: "Thought deleted successfully.",
            thoughtId
        })
    } catch (error) {
        if (error instanceof Exception) {
            // fix typings here

            return createNetworkResponse({ from: { exception: error as unknown as Exception<"network", NetworkExceptionID> } })
        }

        return NextResponse.json({ error: "Failed to delete thought." }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id: thoughtId } = await params

        if (!thoughtId) {
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    }
                }
            })
        }

        // Verify thought exists
        const existingThought = await db.query.thoughts.findFirst({
            where: eq(thoughts.id, thoughtId),
            with: {
                tempValues: true
            }
        })

        if (!existingThought) {
            return NextResponse.json({ error: "Thought not found." }, { status: 404 })
        }

        // Parse update data from request body
        const updates = (await request.json()) as Record<string, unknown>

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No update fields provided." }, { status: 400 })
        }

        // Validate all keys in the request
        for (const key of Object.keys(updates)) {
            // Check if key is a valid thought property
            if (key !== "content" && !key.startsWith("TEMP_")) {
                return NextResponse.json(
                    {
                        error: `Invalid field: '${key}'. Field must be a valid thought property or start with 'TEMP_'.`
                    },
                    { status: 400 }
                )
            }
        }

        // Process updates
        const thoughtUpdates: Record<string, unknown> = {}
        const tempUpdates: Record<string, string> = {}

        // Handle each update field with strict validation
        for (const [key, value] of Object.entries(updates)) {
            // Validate and process thought property updates
            if (key === "content") {
                if (typeof value !== "string") {
                    return NextResponse.json(
                        {
                            error: "Content must be a string."
                        },
                        { status: 400 }
                    )
                }
                thoughtUpdates.content = value
            }
            // Process temp values (with TEMP_ prefix)
            else if (key.startsWith("TEMP_")) {
                if (value === undefined || value === null) {
                    continue // Skip undefined/null values
                }

                const actualKey = key.substring(5) // Remove TEMP_ prefix

                // Handle special validations for known temp fields
                if (actualKey === "validated" && !["true", "false"].includes(value as string)) {
                    return NextResponse.json(
                        {
                            error: "Validated must be a string boolean."
                        },
                        { status: 400 }
                    )
                }

                // Convert objects to JSON strings to avoid [object Object]

                let stringValue: string

                if (typeof value === "object" && value !== null) {
                    try {
                        stringValue = JSON.stringify(value)
                    } catch {
                        return NextResponse.json(
                            {
                                error: "Invalid temp value. Must be a string or JSON object."
                            },
                            { status: 400 }
                        )
                    }
                } else if (typeof value === "string") {
                    stringValue = value
                } else {
                    return NextResponse.json(
                        {
                            error: "Invalid temp value. Must be a string or JSON object."
                        },
                        { status: 400 }
                    )
                }

                tempUpdates[actualKey] = stringValue
            }
        }

        // Initialize response object from existing thought
        const response = {
            ...Object.fromEntries(Object.entries(existingThought).filter(([key]) => key !== "tempValues"))
        } as Record<string, unknown>

        // Add existing temp values to response
        const tempValuesMap = new Map<string, string>()
        for (const tempValue of existingThought.tempValues) {
            tempValuesMap.set(tempValue.key, tempValue.value)
            response[tempValue.key] = tempValue.value
        }

        // Update the thought record if needed
        if (Object.keys(thoughtUpdates).length > 0) {
            await db
                .update(thoughts)
                .set({
                    ...thoughtUpdates,
                    updatedAt: new Date() // Always update the timestamp
                })
                .where(eq(thoughts.id, thoughtId))

            // Update response with new values
            Object.assign(response, thoughtUpdates)
            response.updatedAt = new Date() // Update the timestamp in the response
        }

        // Process temp value updates
        for (const [key, value] of Object.entries(tempUpdates)) {
            await setTempValue(thoughtId, key, value)

            // Update response with new temp values
            response[key] = value
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error updating thought:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({ from: { exception: error as unknown as Exception<"network", NetworkExceptionID> } })
        }

        return NextResponse.json({ error: "Failed to update thought." }, { status: 500 })
    }
}
