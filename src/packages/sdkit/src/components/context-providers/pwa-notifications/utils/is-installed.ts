/**
 *
 */

export function isPwaInstalled(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches
}
