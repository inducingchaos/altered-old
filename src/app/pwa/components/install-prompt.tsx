/**
 *
 */

import { useEffect, useState, type JSX } from "react"

/**
 * @todo
 * - [P3] Replace with shadcn/ui dialog.
 */
export function InstallPrompt(): JSX.Element | null {
    const [OS, setOS] = useState<"iOS" | "Android" | undefined>()
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        setOS(
            navigator.userAgent.includes("iPad") ||
                navigator.userAgent.includes("iPhone") ||
                navigator.userAgent.includes("iPod")
                ? "iOS"
                : navigator.userAgent.includes("Android")
                  ? "Android"
                  : undefined
        )

        setIsInstalled(window.matchMedia("(display-mode: standalone)").matches)
    }, [])

    if (isInstalled) return null

    return (
        <div className="flex flex-col items-center justify-center">
            <h3 className="text-24px font-bold">Install App</h3>
            <p>
                {OS === "iOS"
                    ? "To install this app on your iOS device: tap the share button, and then 'Add to Home Screen'."
                    : OS === "Android"
                      ? "To install this app: tap the three-dot menu and select 'Install App' or 'Add to Home Screen'."
                      : "To install this app: click the install icon in your browser's address bar."}
            </p>
        </div>
    )
}
