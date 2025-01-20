/**
 *
 */

import type { Exception } from "@sdkit/meta/exception"
import type { Dispatch, SetStateAction } from "react"

export type PWANotificationContextStateSetters = {
    setIsSupported: Dispatch<SetStateAction<boolean>>
    setIsGrantedPermission: Dispatch<SetStateAction<boolean | undefined>>
    setSubscription: Dispatch<SetStateAction<PushSubscription | null | undefined>>
    setError: Dispatch<SetStateAction<Exception | null>>
}
