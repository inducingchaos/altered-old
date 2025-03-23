/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

// Define dataset type based on temp table storage
export type Dataset = {
    id: string
    title: string
}

export async function getDatasets(search?: string): Promise<Dataset[]> {
    // Find all temp rows with key="dataset_title" to get all datasets
    const datasets = await db.query.temp.findMany({
        where: eq(temp.key, "dataset_title")
    })

    // Map to dataset format - ensuring correct types
    const allDatasets: Dataset[] = datasets.map(d => {
        // Ensure string types
        const id = String(d.id || "")
        const title = String(d.value || "")
        return { id, title }
    })

    // Filter datasets if search query is provided
    const filteredDatasets = search ? allDatasets.filter(d => d.title.toLowerCase().includes(search)) : allDatasets

    return filteredDatasets
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const searchParams = request.nextUrl.searchParams
        const search = searchParams.get("search")?.toLowerCase()

        return NextResponse.json(await getDatasets(search))
    } catch (error) {
        console.error("Error fetching datasets:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to fetch datasets." }, { status: 500 })
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const body = await request.json()
        const { title } = body as { title: string }

        if (!title) {
            return NextResponse.json({ error: "Title is required." }, { status: 400 })
        }

        // Generate a unique ID for the dataset (will be used as the thoughtId in the temp table)
        const datasetId = nanoid()

        // Insert dataset title as a temp value
        await db.insert(temp).values({
            id: nanoid(),
            key: "dataset_title",
            value: title,
            thoughtId: "kv",
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const dataset: Dataset = {
            id: datasetId,
            title
        }

        return NextResponse.json(dataset)
    } catch (error) {
        console.error("Error creating dataset:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to create dataset." }, { status: 500 })
    }
}
