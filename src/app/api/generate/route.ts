/**
 * API route for generating AI responses based on thoughts
 */

import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { resolvePrompt } from "~/server/utils/prompts"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Check authentication
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        // Parse the request body
        const body = (await request.json()) as { prompt?: string }
        const prompt = body.prompt

        if (!prompt) {
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'prompt' field."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'prompt' field."
                    }
                }
            })
        }

        // Get the fully resolved system prompt with variables populated
        const systemPrompt = await resolvePrompt("thought-generation")

        // Create a stream using streamText with explicit typing
        const result = streamText({
            model: openai("gpt-4o-mini"),
            system: systemPrompt,
            prompt: prompt
        })

        // Return the streaming response
        return result.toTextStreamResponse() as NextResponse
    } catch (error) {
        console.error("Error in generate endpoint:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to generate response." }, { status: 500 })
    }
}
