import { eq, and } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

/**
 * Deletes all thought-dataset relations that reference a specific dataset ID
 * @param datasetId The ID of the dataset to remove from relations
 */
async function deleteDatasetRelations(datasetId: string): Promise<void> {
    try {
        // 1. Get all dataset relations
        const relations = await db.query.temp.findMany({
            where: eq(temp.key, "datasets")
        })

        // 2. Find relations that contain our dataset ID
        const relationsToUpdate = relations.filter(relation => {
            try {
                const datasetIds = JSON.parse(String(relation.value ?? "[]")) as string[]
                return datasetIds.includes(datasetId)
            } catch (error) {
                console.error("Error parsing relation value:", error)
                return false
            }
        })

        // 3. For each relation:
        for (const relation of relationsToUpdate) {
            try {
                const datasetIds = JSON.parse(String(relation.value ?? "[]")) as string[]

                // If this relation only references our dataset, delete it entirely
                if (datasetIds.length === 1 && datasetIds[0] === datasetId) {
                    await db.delete(temp).where(and(eq(temp.id, relation.id), eq(temp.key, "datasets")))
                }
                // Otherwise, update the relation to remove our dataset ID
                else {
                    const updatedDatasetIds = datasetIds.filter(id => id !== datasetId)
                    await db
                        .update(temp)
                        .set({
                            value: JSON.stringify(updatedDatasetIds),
                            updatedAt: new Date()
                        })
                        .where(and(eq(temp.id, relation.id), eq(temp.key, "datasets")))
                }
            } catch (error) {
                console.error("Error updating relation:", error)
                // Continue with next relation even if one fails
            }
        }
    } catch (error) {
        console.error("Error deleting dataset relations:", error)
        throw error
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json({ error: "Dataset ID is required." }, { status: 400 })
        }

        const { title } = (await request.json()) as { title: string }

        if (!title) {
            return NextResponse.json({ error: "Title is required." }, { status: 400 })
        }

        // Update the dataset title and check if it exists
        const { rowsAffected } = await db
            .update(temp)
            .set({
                value: title,
                updatedAt: new Date()
            })
            .where(and(eq(temp.id, id), eq(temp.key, "dataset_title")))

        if (rowsAffected === 0) {
            return NextResponse.json({ error: "Dataset not found." }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Dataset updated successfully.",
            dataset: {
                id,
                title,
                updatedAt: new Date()
            }
        })
    } catch (error) {
        console.error("Error updating dataset:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to update dataset." }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json({ error: "Dataset ID is required." }, { status: 400 })
        }

        // Delete the dataset first to check if it exists
        const { rowsAffected } = await db.delete(temp).where(and(eq(temp.id, id), eq(temp.key, "dataset_title")))

        if (rowsAffected === 0) {
            return NextResponse.json({ error: "Dataset not found." }, { status: 404 })
        }

        // If dataset was deleted successfully, clean up relations
        await deleteDatasetRelations(id)

        return NextResponse.json({ success: true, message: "Dataset deleted successfully." })
    } catch (error) {
        console.error("Error deleting dataset:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to delete dataset." }, { status: 500 })
    }
}
