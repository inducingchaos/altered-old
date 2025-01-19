/**
 *
 */

import type { NetworkStatusCode } from "@sdkit/types/api"

export type LocalizationConfig = {
    network: {
        statusMessages: Partial<Record<NetworkStatusCode, string>>
    }
}
