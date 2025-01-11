/**
 *
 */

export type PathsConfig = {
    pages: Record<string, unknown>
    assets: Partial<Record<"favicon" | "og" | "logo" | "brandmark" | "logotype", string>>
    api: {
        base: string
        endpoints: Record<string, unknown>
    }
}
