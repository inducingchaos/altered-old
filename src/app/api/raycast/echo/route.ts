/**
 *
 */

import { NextResponse, type NextRequest } from "next/server"
import { getDeploymentInfo } from "./get-deployment-info"

export const runtime = "edge"

export async function GET(_req: NextRequest): Promise<NextResponse> {
    return NextResponse.json(await getDeploymentInfo())
}
