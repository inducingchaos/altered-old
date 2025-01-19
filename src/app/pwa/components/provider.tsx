// /**
//  *
//  */

// import { createContext, type ReactNode, useMemo, useState } from "react"

// type PWANotificationState = {
//     isSupported: boolean
//     workerSubscription: PushSubscription | null
//     error: string | null
//     isGranted: boolean
//     isDenied: boolean
//     handleSubscribe: () => Promise<void>
//     handleUnsubscribe: () => Promise<void>
// }

// export const PWANotificationContext = createContext<PWANotificationState | undefined>(undefined)

// export function PWANotificationProvider({ children }: { children: ReactNode }) {
//     const [workerSubscription, setWorkerSubscription] = useState<PushSubscription | null>(null)
//     const [isSupported, setIsSupported] = useState(false)
//     const [isGranted, setIsGranted] = useState(false)
//     const [isDenied, setIsDenied] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     const value = useMemo(
//         () => ({
//             workerSubscription,
//             error,
//             isSupported,
//             isGranted,
//             isDenied,
//             handleSubscribe,
//             handleUnsubscribe
//         }),
//         [workerSubscription, error, isSupported, isGranted, isDenied]
//     )

//     return <PWANotificationContext.Provider value={value}>{children}</PWANotificationContext.Provider>
// }
