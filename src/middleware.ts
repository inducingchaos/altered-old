/**
 *
 */

import { NextResponse, type NextRequest } from "next/server"

export const config = { matcher: ["/((?!_next|api|_static|_vercel|[\\w-]+\\.\\w+).*)"] }

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const { hostname, pathname, search, hash } = request.nextUrl

    if (hostname.endsWith("altered.app") && pathname.startsWith("/kaitype"))
        return NextResponse.redirect(
            new URL(`https://kaitype.co${pathname.replace("/kaitype", "")}${search}${hash}`, request.url),
            { status: 308 }
        )

    if (hostname.endsWith("kaitype.co"))
        return NextResponse.rewrite(new URL(`/kaitype${pathname}${search}${hash}`, request.url))

    return NextResponse.next()
}
