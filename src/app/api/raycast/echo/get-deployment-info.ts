/**
 *
 */

import { vercel } from "~/lib/providers"

export type DeploymentInfo =
    | {
          deployment: {
              id: string
              createdAt: string
              createdIn: string
              name: string
              meta: {
                  githubCommitAuthorName: string | undefined
                  githubCommitOrg: string | undefined
                  githubCommitMessage: string | undefined
              }
              readyState: string
              target: string | null | undefined
          }
      }
    | { error: unknown }

export async function getDeploymentInfo(): Promise<DeploymentInfo> {
    try {
        const projects = await vercel.projects.getProjects({ search: "altered" })
        const latestDeployment = projects.projects?.[0]?.latestDeployments?.[0]
        if (!latestDeployment) throw new Error("No deployment found.")

        const { id, createdAt, createdIn, name, meta, readyState, target } = latestDeployment

        return {
            deployment: {
                id,
                createdAt: new Date(createdAt)
                    .toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                    })
                    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2"),
                createdIn,
                name,
                meta: {
                    githubCommitAuthorName: meta?.githubCommitAuthorName,
                    githubCommitOrg: meta?.githubCommitOrg,
                    githubCommitMessage: meta?.githubCommitMessage
                },
                readyState: readyState,
                target: target
            }
        }
    } catch (error) {
        return { error }
    }
}
