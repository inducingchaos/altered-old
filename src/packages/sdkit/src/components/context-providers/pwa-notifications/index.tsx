/**
 *
 */

"use client"

import { type Exception } from "@sdkit/meta/exception"
import { useEffect, useState, type JSX } from "react"
import { PWANotificationContext } from "./context"
import type { PWANotificationContextProviderProps } from "./types"
import { getOS } from "./utils/get-os"
import { pwaNotificationsContextHandleSubscribe } from "./utils/handle-subscribe"
import { pwaNotificationsContextHandleUnsubscribe } from "./utils/handle-unsubscribe"
import { isPwaInstalled } from "./utils/is-installed"
import { isPermissionGranted } from "./utils/is-permission-granted"
import { isPwaNotificationsSupported } from "./utils/is-supported"
import { pwaNotificationsContextRegisterWorker } from "./utils/register-worker"

export function PWANotificationContextProvider({ children }: PWANotificationContextProviderProps): JSX.Element {
    const [isSupported, setIsSupported] = useState(false)
    const [isGrantedPermission, setIsGrantedPermission] = useState<boolean | undefined>()
    const [isInstalled, setIsInstalled] = useState(false)
    const [os, setOS] = useState<"iOS" | "Android" | undefined>()
    const [subscription, setSubscription] = useState<PushSubscription | null | undefined>()
    const [error, setError] = useState<Exception | null>(null)

    useEffect(() => {
        const _isSupported = isPwaNotificationsSupported()
        setIsSupported(_isSupported)

        const _isGrantedPermission = isPermissionGranted()
        setIsGrantedPermission(_isGrantedPermission)

        setIsInstalled(isPwaInstalled())
        setOS(getOS())

        if (_isSupported && _isGrantedPermission)
            void pwaNotificationsContextRegisterWorker({
                setters: { setSubscription, setError }
            })
    }, [])

    return (
        <PWANotificationContext.Provider
            value={{
                isSupported,
                isGrantedPermission,
                isSubscribed: !!subscription,
                isInstalled,
                // rename to operating system
                os,
                subscription,
                error,
                // Make props non-options
                handleSubscribe: () =>
                    pwaNotificationsContextHandleSubscribe({
                        setters: { setSubscription, setError, setIsGrantedPermission }
                    }),
                handleUnsubscribe: () =>
                    pwaNotificationsContextHandleUnsubscribe({
                        subscription,
                        setters: { setSubscription, setError }
                    })
            }}
        >
            {children}
        </PWANotificationContext.Provider>
    )
}

export * from "./use"
