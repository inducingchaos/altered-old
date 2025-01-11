/**
 *
 */

import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const { hostname, pathname, search, hash } = request.nextUrl

    if (/\.(.*)$/.test(pathname) || pathname.includes("_next")) return NextResponse.next()

    if (hostname.endsWith("altered.app") && pathname.startsWith("/kaitype"))
        return NextResponse.redirect(
            new URL(`https://kaitype.co${pathname.replace("/kaitype", "")}${search}${hash}`, request.url),
            { status: 308 }
        )

    if (hostname.endsWith("kaitype.co"))
        return NextResponse.rewrite(new URL(`/kaitype${pathname}${search}${hash}`, request.url))

    return NextResponse.next()
}
