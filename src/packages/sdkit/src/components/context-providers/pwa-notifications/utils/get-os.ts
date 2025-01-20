/**
 *
 */

export type OS = "iOS" | "Android" | undefined

export function getOS(): OS {
    return navigator.userAgent.includes("iPad") ||
        navigator.userAgent.includes("iPhone") ||
        navigator.userAgent.includes("iPod")
        ? "iOS"
        : navigator.userAgent.includes("Android")
          ? "Android"
          : undefined
}
