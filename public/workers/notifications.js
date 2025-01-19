/**
 *
 */

self.addEventListener("install", console.log("Service Worker installing."))
self.addEventListener("activate", console.log("Service Worker activating."))

self.addEventListener("push", event => {
    if (!event.data) return
    const { title, body, icon, url } = event.data.json()

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            data: { url }
        })
    )
})

self.addEventListener("notificationclick", event => {
    event.notification.close()

    if (!event.notification.data.url) return

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) if (client.url === url && "focus" in client) return client.focus()

            return clients.openWindow(event.notification.data.url)
        })
    )
})
