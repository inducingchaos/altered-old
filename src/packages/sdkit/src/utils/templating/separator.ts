/**
 *
 */

export type Separator = "colon" | "pipe" | "em-dash" | "dash"

export function getSeparator({ for: separator }: { for: Separator }): string {
    switch (separator) {
        case "colon":
            return ": "
        case "pipe":
            return " | "
        case "em-dash":
            return " — "
        case "dash":
            return " - "
    }
}
