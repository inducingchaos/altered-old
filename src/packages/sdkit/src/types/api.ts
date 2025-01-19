/**
 *
 */

import type { NETWORK_ERROR_STATUSES, NETWORK_STATUSES, NETWORK_SUCCESS_STATUSES } from "@sdkit/constants/api"

export type NetworkStatusName = (typeof NETWORK_STATUSES)[keyof typeof NETWORK_STATUSES]
export type NetworkStatusCode = keyof typeof NETWORK_STATUSES

export type NetworkSuccessStatusName = (typeof NETWORK_SUCCESS_STATUSES)[keyof typeof NETWORK_SUCCESS_STATUSES]
export type NetworkSuccessStatusCode = keyof typeof NETWORK_SUCCESS_STATUSES

export type NetworkErrorStatusName = (typeof NETWORK_ERROR_STATUSES)[keyof typeof NETWORK_ERROR_STATUSES]
export type NetworkErrorStatusCode = keyof typeof NETWORK_ERROR_STATUSES
