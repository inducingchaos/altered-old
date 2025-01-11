/**
 *
 */

import config from "@kaitype/config"
import { createPageMetadata } from "@sdkit/framework/pages"
import type { JSX, ReactNode } from "react"

export const metadata = createPageMetadata({ using: config })

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
    return <>{children}</>
}
