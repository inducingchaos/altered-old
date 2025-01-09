/**
 *
 */

import "@sdkit/styles/globals.css"
import type { Metadata } from "next"
import type { JSX, ReactNode } from "react"

import { geist, geistMono, hoeflerText, inter, pxGrotesk, pxGroteskMono, saans } from "@sdkit/styles/fonts"

const project = {
    info: {
        name: "ALTERED",
        tagline: "Where Entropy Meets Order",
        description: "Knowledge systems for the obsessed."
    }
}

export const metadata: Metadata = {
    title: `${project.info.name} | ${project.info.tagline}`,
    description: project.info.description,
    icons: [{ rel: "icon", url: "/design/favicon.png" }],
    keywords: null
}

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${pxGrotesk.variable} ${pxGroteskMono.variable} ${hoeflerText.variable} ${saans.variable} ${inter.variable} ${geist.variable} ${geistMono.variable} [.font-mono]:tracking-tighter tracking-normal`}
            >
                {children}
            </body>
        </html>
    )
}
