/**
 *
 */

import { NextResponse, type NextRequest } from "next/server"

const responses = [
    "Echo!",
    "You never could have guessed...",
    "I'm sorry, you've reached the right place.",
    "Could you imagine winning the lottery?",
    "ALTERED is the future."
]

export async function GET(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json({ message: responses[Math.floor(Math.random() * responses.length)] })
}
