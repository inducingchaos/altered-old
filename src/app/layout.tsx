/**
 *
 */

import type { JSX } from "react"
import "./globals.css"

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>): JSX.Element {
    return (
        <html lang="en">
            <body className={`${""} antialiased`}>{children}</body>
        </html>
    )
}
