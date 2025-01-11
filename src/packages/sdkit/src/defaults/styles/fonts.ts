/**
 *
 */

import { Geist, Geist_Mono, Inter } from "next/font/google"
import localFont from "next/font/local"

export const pxGrotesk = localFont({
    src: [
        {
            path: "../../assets/typefaces/px-grotesk-trial-thin.otf",
            weight: "100",
            style: "normal"
        },
        {
            path: "../../assets/typefaces/px-grotesk-trial-thin-italic.otf",
            weight: "100",
            style: "italic"
        },

        {
            path: "../../assets/typefaces/px-grotesk-light.woff2",
            weight: "300",
            style: "normal"
        },
        // {
        //     path: "../../assets/typefaces/px-grotesk-trial-light-italic.otf",
        //     weight: "300",
        //     style: "italic"
        // },

        {
            path: "../../assets/typefaces/px-grotesk-regular.otf",
            weight: "400",
            style: "normal"
        },
        // {
        //     path: "../../assets/typefaces/px-grotesk-trial-regular-italic.otf",
        //     weight: "400",
        //     style: "italic"
        // },

        {
            path: "../../assets/typefaces/px-grotesk-bold.otf",
            weight: "700",
            style: "normal"
        },
        // {
        //     path: "../../assets/typefaces/px-grotesk-trial-bold-italic.otf",
        //     weight: "700",
        //     style: "italic"
        // },

        {
            path: "../../assets/typefaces/px-grotesk-trial-black.otf",
            weight: "900",
            style: "normal"
        },
        {
            path: "../../assets/typefaces/px-grotesk-trial-black-italic.otf",
            weight: "900",
            style: "italic"
        }
    ],
    variable: "--font-px-grotesk"
})

export const pxGroteskMono = localFont({
    src: [
        {
            path: "../../assets/typefaces/px-grotesk-mono-trial-light.otf",
            weight: "300",
            style: "normal"
        },
        {
            path: "../../assets/typefaces/px-grotesk-mono-trial-light-italic.otf",
            weight: "300",
            style: "italic"
        },

        {
            path: "../../assets/typefaces/px-grotesk-mono-regular.otf",
            weight: "400",
            style: "normal"
        }
        // {
        //     path: "../../assets/typefaces/px-grotesk-mono-trial-regular-italic.otf",
        //     weight: "400",
        //     style: "italic"
        // },

        // {
        //     path: "../../assets/typefaces/px-grotesk-mono-trial-bold.otf",
        //     weight: "700",
        //     style: "normal"
        // },
        // {
        //     path: "../../assets/typefaces/px-grotesk-mono-trial-bold-italic.otf",
        //     weight: "700",
        //     style: "italic"
        // }
    ],
    variable: "--font-px-grotesk-mono"
})

export const pxGroteskScreen = localFont({
    src: "../../assets/typefaces/px-grotesk-screen-regular.otf",
    variable: "--font-px-grotesk-screen"
})

export const hoeflerText = localFont({
    src: [
        {
            path: "../../assets/typefaces/hoefler-text-regular.ttf",
            weight: "400",
            style: "normal"
        },
        {
            path: "../../assets/typefaces/hoefler-text-regular-italic.ttf",
            weight: "400",
            style: "italic"
        },

        {
            path: "../../assets/typefaces/hoefler-text-black.ttf",
            weight: "900",
            style: "normal"
        },
        {
            path: "../../assets/typefaces/hoefler-text-black-italic.ttf",
            weight: "900",
            style: "italic"
        }
    ],
    variable: "--font-hoefler-text"
})

export const saans = localFont({
    src: "../../assets/typefaces/saans-variable.woff2",
    variable: "--font-saans"
})

export const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter"
})

export const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist"
})

export const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono"
})
