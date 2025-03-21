/**
 * API route for individual system prompts
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { getSystemPrompt, updateSystemPrompt } from "~/server/utils/prompts"
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
    params: {
        id: string
    }
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

        const { id } = params
        if (!id) {
            return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 })
        }

        const promptContent = await getSystemPrompt(id)
        return NextResponse.json({ id, content: promptContent })
    } catch (error) {
        console.error(`Error fetching prompt ${params.id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to fetch prompt." }, { status: 500 })
    }
}

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

        const { id } = params
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
        const updatedPrompt = await updateSystemPrompt(id, content, name)

        return NextResponse.json(updatedPrompt)
    } catch (error) {
        console.error(`Error updating prompt ${params.id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to update prompt." }, { status: 500 })
    }
}
