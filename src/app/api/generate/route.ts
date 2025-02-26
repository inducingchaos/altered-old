/**
 * API route for generating AI responses based on thoughts
 */

import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts as thoughtsSchema } from "~/server/data/schemas/iiinput/thoughts"

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

        // Fetch thoughts from the database in chronological order
        const thoughts = await db
            .select({ content: thoughtsSchema.content })
            .from(thoughtsSchema)
            .orderBy(thoughtsSchema.createdAt)
            .limit(100) // Limit to prevent overwhelming the context window

        // Extract just the content field
        const thoughtContents = thoughts.map(thought => thought.content)

        // Create system instruction
        const systemPrompt = `
You are responding as if you are an extension of the digital brain represented by the following thoughts.
Use "I" instead of "you" or "we" - respond as if you ARE the digital brain.
Use these thoughts as your knowledge base, but you're not limited to just this information.
Respond in the same persona/character as these thoughts if applicable.

Here are the thoughts in chronological order:
${thoughtContents.join("\n\n")}
`

        console.log(systemPrompt)
        // Create a stream using streamText with explicit typing
        const result = streamText({
            model: openai("gpt-4o-mini"),
            system: systemPrompt,
            prompt: prompt
        })

        console.log(result)

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
