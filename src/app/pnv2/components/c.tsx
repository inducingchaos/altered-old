/**
 *
 */

import { type JSX } from "react"

export const UnsupportedNotificationMessage = (): JSX.Element => {
    return (
        <div className="w-full max-w-md bg-white p-24px">
            <p className="text-center text-red-500">
                Push notifications are not supported in this browser. Consider adding to the home screen (PWA) if on iOS.
            </p>
            {/* <Image src="/ios-pwa/pwa_ios.jpg" width={10000} height={10000} alt="Push Notification" className="size-auto" /> */}
        </div>
    )
}
