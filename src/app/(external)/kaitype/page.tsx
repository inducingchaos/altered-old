/**
 *
 */

import config from "@kaitype/config"
import type { JSX } from "react"

export default function Kaitype(): JSX.Element {
    return (
        <div className="flex h-screen items-center justify-center">
            <a className="text-info hover:underline" href={`mailto:${config.brand.emails.support}`}>
                {config.brand.emails.support}
            </a>
        </div>
    )
}
