/**
 *
 */

import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl

    if (/\.(.*)$/.test(pathname) || pathname.includes("_next")) return NextResponse.next()

    if (pathname === "/preflight") {
        return NextResponse.redirect(new URL("https://8mdalvdc6by.typeform.com/to/s6zgE0Xu", request.url))
    }

    return NextResponse.next()
}
