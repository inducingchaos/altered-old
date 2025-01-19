/**
 *
 */

import type { SecurityConfig } from "@sdkit/config"

export const security = {
    expirations: {
        pushNotificationSubscription: 365 * 24 * 3600 * 1000,
        session: 30 * 24 * 3600 * 1000
    }
} satisfies SecurityConfig
