import React, { useState } from "react"
import { useNotification } from "~/notifications/useNotification"
import { thePushEndpoint } from "../actions"

export const NotificationSubscriptionForm = (): React.JSX.Element => {
    const { subscription } = useNotification()

    const [message, setMessage] = useState("")
    const [title, setTitle] = useState("")

    const sendNotification = async (): Promise<void> => {
        await thePushEndpoint({ title, message, subscription: subscription!.toJSON() })
        setMessage("")
        setTitle("")
    }

    return (
        <div className="w-full max-w-md bg-white p-24px">
            <h2 className="text-16px font-bold">Send a Notification</h2>

            {/* Title Input */}
            <input
                type="text"
                placeholder="Notification Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 p-8px"
            />

            {/* Message Input */}
            <textarea
                placeholder="Notification Message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-gray-300 p-8px"
            />

            <button
                onClick={() => sendNotification()}
                className="w-full bg-green-500 px-16px py-8px text-white transition hover:bg-green-600"
            >
                Send Notification
            </button>
        </div>
    )
}
