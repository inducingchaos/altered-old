/**
 *
 */

export function urlBase64ToUint8Array({ fromString: base64String }: { fromString: string }): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    return Uint8Array.from(rawData, char => char.charCodeAt(0))
}
