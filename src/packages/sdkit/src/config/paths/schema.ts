/**
 *
 */

export type PathsConfig = {
    pages: Record<string, unknown>
    assets: Partial<Record<"favicon" | "og" | "logo" | "brandmark" | "logotype", string>> & {
        workers?: Record<string, string>
    } & Record<string, unknown>
    api: {
        base: string
        endpoints: Record<string, unknown>
    }
}
