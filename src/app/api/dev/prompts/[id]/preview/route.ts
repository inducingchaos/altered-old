/**
 * Debug API route for previewing prompts with variables resolved
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { previewPrompt } from "~/server/utils/prompts"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

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

        // Get the preview of the prompt with variables resolved
        const preview = await previewPrompt(id)
        return NextResponse.json(preview)
    } catch (error) {
        const { id } = await params
        console.error(`Error previewing prompt ${id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to preview prompt." }, { status: 500 })
    }
}
