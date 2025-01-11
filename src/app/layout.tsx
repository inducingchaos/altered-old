/**
 *
 */

import "@sdkit/defaults/styles/globals.css"
import { createPageMetadata } from "@sdkit/framework/pages"
import type { JSX, ReactNode } from "react"
import config from "~/config"
import {
    geist,
    geistMono,
    hoeflerText,
    inter,
    pxGrotesk,
    pxGroteskMono,
    saans
} from "~/packages/sdkit/src/defaults/styles/fonts"

import "~/styles/overrides.css"

export const metadata = createPageMetadata({ using: config })

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${pxGrotesk.variable} ${pxGroteskMono.variable} ${hoeflerText.variable} ${saans.variable} ${inter.variable} ${geist.variable} ${geistMono.variable} [.font-mono]:tracking-tighter tracking-normal`}
        >
            <body>{children}</body>
        </html>
    )
}
