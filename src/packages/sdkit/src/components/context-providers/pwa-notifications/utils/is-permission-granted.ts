/**
 *
 */

export function isPermissionGranted(): boolean | undefined {
    if (Notification.permission === "granted") return true
    if (Notification.permission === "denied") return false
    return undefined
}
