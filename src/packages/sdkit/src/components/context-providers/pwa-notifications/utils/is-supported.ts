/**
 *
 */

export function isPwaNotificationsSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window && "showNotification" in ServiceWorkerRegistration.prototype
}
