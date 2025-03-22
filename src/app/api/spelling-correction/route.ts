/**
 * API route for correcting spelling errors in text
 */

import { generateText } from "ai"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { getModelForFeature } from "~/server/utils/model-selector"
import { AIFeature } from "~/server/config/ai/models"

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
        const body = (await request.json()) as { text?: string }
        const text = body.text

        if (!text) {
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'text' field."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'text' field."
                    }
                }
            })
        }

        // Get the preferred model for spelling correction
        const model = await getModelForFeature(AIFeature.SPELLING_CORRECTION)

        // Create a system prompt for spelling correction
        const systemPrompt = `
            You are a spelling and grammar correction assistant.
            Your task is to correct any spelling and grammar errors in the provided text.
            Return ONLY the corrected text with no additional explanations.
            Maintain the original style, tone, and formatting.
        `.trim()

        // Generate the corrected text
        const result = await generateText({
            model,
            system: systemPrompt,
            prompt: text
        })

        // Return the corrected text
        return NextResponse.json({
            original: text,
            corrected: result.text,
            success: true
        })
    } catch (error) {
        console.error("Error in spelling correction endpoint:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to correct spelling.", success: false }, { status: 500 })
    }
}
