/**
 *
 */

import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl

    if (/\.(.*)$/.test(pathname) || pathname.includes("_next")) return NextResponse.next()

    return NextResponse.next()
}
