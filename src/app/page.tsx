/**
 *
 */

import config from "~/config"
import type { JSX } from "react"

export default function Home(): JSX.Element {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>
                {"Powering: "}
                <a href={config.brand.links.site} className="text-info hover:underline">
                    {config.brand.info.name}
                </a>
            </p>
        </div>
    )
}
