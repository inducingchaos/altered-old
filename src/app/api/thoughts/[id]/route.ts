/**
 * API routes for thoughts with ID
 */

// spell-checker: disable

import { eq, and } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts, type Thought } from "~/server/data/schemas/iiinput"
import { temp } from "~/server/data/schemas/iiinput/temp"
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
            ...Object.fromEntries(
                thoughtResult.tempValues.map(tv => {
                    // Try to parse JSON strings for arrays and objects
                    const value = tv.value
                    try {
                        // Check if the value looks like JSON
                        if (value && (value.startsWith("[") || value.startsWith("{"))) {
                            const parsed = JSON.parse(value) as unknown
                            return [tv.key, parsed]
                        }
                    } catch {
                        // If parsing fails, return the original string
                    }
                    return [tv.key, value]
                })
            )
        } as Thought & Record<string, unknown>

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

        // Get all dataset sorting orders that contain this thought
        const sortingOrders = await db.query.temp.findMany({
            where: eq(temp.key, "dataset-sorting")
        })

        // Update each sorting order that contains the thought ID
        for (const order of sortingOrders) {
            try {
                const thoughtIds = JSON.parse(String(order.value ?? "[]")) as string[]
                if (thoughtIds.includes(thoughtId)) {
                    const updatedThoughtIds = thoughtIds.filter(id => id !== thoughtId)
                    await db
                        .update(temp)
                        .set({
                            value: JSON.stringify(updatedThoughtIds),
                            updatedAt: new Date()
                        })
                        .where(and(eq(temp.id, order.id), eq(temp.key, "dataset-sorting")))
                }
            } catch (error) {
                console.error("Error updating sorting order:", error instanceof Error ? error.message : String(error))
                // Continue with next order even if one fails
            }
        }

        // First delete all temp values associated with this thought
        await db.delete(temp).where(eq(temp.thoughtId, thoughtId))

        // Then delete the thought with the specified ID
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

                if (actualKey === "datasets") {
                    try {
                        // Validate datasets array - value should already be an array from the frontend
                        const newDatasets = Array.isArray(value)
                            ? (value as string[])
                            : (JSON.parse(value as string) as string[])
                        if (!Array.isArray(newDatasets)) {
                            return NextResponse.json(
                                {
                                    error: "Datasets must be an array."
                                },
                                { status: 400 }
                            )
                        }

                        // Get current datasets to find removed ones
                        const currentDatasetsTemp = existingThought.tempValues.find(tv => tv.key === "datasets")
                        const currentDatasets = currentDatasetsTemp ? (JSON.parse(currentDatasetsTemp.value) as string[]) : []

                        // Find datasets that the thought was removed from
                        const removedDatasets = currentDatasets.filter(id => !newDatasets.includes(id))

                        // Update sorting orders for datasets that lost this thought
                        for (const datasetId of removedDatasets) {
                            const sortingOrder = await db.query.temp.findFirst({
                                where: and(eq(temp.thoughtId, datasetId), eq(temp.key, "dataset-sorting"))
                            })

                            if (sortingOrder) {
                                try {
                                    const thoughtIds = JSON.parse(sortingOrder.value) as string[]
                                    if (thoughtIds.includes(thoughtId)) {
                                        const updatedThoughtIds = thoughtIds.filter(id => id !== thoughtId)
                                        await db
                                            .update(temp)
                                            .set({
                                                value: JSON.stringify(updatedThoughtIds),
                                                updatedAt: new Date()
                                            })
                                            .where(and(eq(temp.id, sortingOrder.id), eq(temp.key, "dataset-sorting")))
                                    }
                                } catch (error) {
                                    console.error(
                                        "Error updating sorting order:",
                                        error instanceof Error ? error.message : String(error)
                                    )
                                }
                            }
                        }

                        stringValue = JSON.stringify(newDatasets)
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error)
                        console.error("Error processing datasets:", message)
                        return NextResponse.json(
                            {
                                error: "Invalid datasets array format."
                            },
                            { status: 400 }
                        )
                    }
                } else {
                    // Convert to string safely (for numbers, booleans, etc.)
                    stringValue = String(value as number | boolean)
                }

                // convert to kebab-case from camelCase
                const kebabCaseKey = actualKey.replace(/([A-Z])/g, "-$1").toLowerCase()

                tempUpdates[kebabCaseKey] = stringValue
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

        //  COULD ADD ALIAS GENERATION HERE IF NEEDED BASED ON IF THE CONTENT HAS CHANGED

        // Process temp value updates
        for (const [key, value] of Object.entries(tempUpdates)) {
            await setTempValue(thoughtId, key, value)

            // Update response with new temp values
            try {
                // Check if the value looks like JSON
                if (value && typeof value === "string" && (value.startsWith("[") || value.startsWith("{"))) {
                    response[key] = JSON.parse(value)
                    continue
                }
            } catch {
                // If parsing fails, use the original string
            }
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
