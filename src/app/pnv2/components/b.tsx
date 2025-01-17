/**
 *
 */

import { useNotification } from "~/notifications/useNotification"
import { type JSX } from "react"

const NotificationSubscriptionStatus = (): JSX.Element => {
    const { isSubscribed, handleSubscribe, isGranted, isDenied, errorMessage } = useNotification()

    return (
        <div className="w-full max-w-md bg-white p-24px">
            <h1 className="text-center text-32px font-bold">Push Notification Subscription</h1>

            {isDenied && (
                <p className="text-center text-red-600">
                    You have denied permission for push notifications. To enable, please update your browser settings.
                </p>
            )}

            {errorMessage && <p className="text-center text-red-600">Error: {errorMessage}</p>}

            <div>
                {!isSubscribed && (
                    <button
                        onClick={handleSubscribe}
                        className="w-full bg-blue-500 px-16px py-8px text-white transition hover:bg-blue-600"
                        disabled={isDenied}
                    >
                        Subscribe to Push Notifications
                    </button>
                )}

                {isGranted && (
                    <div className="text-center">
                        <p className="font-semibold text-green-600">You are subscribed!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationSubscriptionStatus
