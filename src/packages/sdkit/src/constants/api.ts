/**
 *
 */

export const networkStatuses = {
    "200": "ok",
    "201": "created",
    "202": "accepted",
    "204": "no-content",

    "400": "bad-request",
    "401": "unauthorized",
    "403": "forbidden",
    "404": "not-found",
    "405": "method-not-allowed",
    "408": "request-timeout",
    "409": "conflict",
    "410": "gone",
    "413": "payload-too-large",
    "415": "unsupported-media-type",
    "429": "too-many-requests",

    "500": "internal-server-error",
    "502": "bad-gateway",
    "503": "service-unavailable",
    "504": "gateway-timeout"
} as const
