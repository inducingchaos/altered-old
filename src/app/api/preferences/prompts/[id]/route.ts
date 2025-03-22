/**
 * API route for individual system prompts
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { getPromptWithMeta, updateSystemPrompt } from "~/server/utils/prompts"
import { z } from "zod"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

// Validation schema for prompt updates
const promptUpdateSchema = z.object({
    content: z.string().min(1),
    name: z.string().min(1).optional()
})

// type PromptUpdateInput = z.infer<typeof promptUpdateSchema>

type Params = {
    params: Promise<{
        id: string
    }>
}

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
            return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 })
        }

        // Get the prompt with metadata (including allowed variables)
        const promptWithMeta = await getPromptWithMeta(id)
        return NextResponse.json(promptWithMeta)
    } catch (error) {
        const { id } = await params
        console.error(`Error fetching prompt ${id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to fetch prompt." }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
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
            return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 })
        }

        // Parse and validate the request body
        const body = (await request.json()) as unknown
        const validation = promptUpdateSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid request data", details: validation.error.format() }, { status: 400 })
        }

        const { content, name } = validation.data

        try {
            // Update the prompt - validation happens in updateSystemPrompt
            const result = await updateSystemPrompt(id, content, name)
            return NextResponse.json(result)
        } catch (error) {
            if (error instanceof Error && error.message.includes("Invalid prompt template")) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }
            throw error
        }
    } catch (error) {
        const { id } = await params
        console.error(`Error updating prompt ${id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to update prompt." }, { status: 500 })
    }
}
