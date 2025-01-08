/**
 *
 */

/**
 * @type { import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions }
 */
export default {
    arrowParens: "avoid",
    bracketSameLine: false,
    bracketSpacing: true,
    endOfLine: "lf",
    htmlWhitespaceSensitivity: "css",
    jsxSingleQuote: false,
    plugins: ["prettier-plugin-tailwindcss"],
    printWidth: 128,
    semi: false,
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "none",
    tailwindFunctions: ["cn", "ucn", "clsx", "cva"]
}
