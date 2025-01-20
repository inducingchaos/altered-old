/**
 *
 */

import { createContext } from "react"
import type { PWANotificationContextState } from "./types"

export const PWANotificationContext = createContext<PWANotificationContextState | undefined>(undefined)
