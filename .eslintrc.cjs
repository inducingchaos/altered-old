/**
 *
 */

/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    parser: "@typescript-eslint/parser",
    parserOptions: { project: true, warnOnUnsupportedTypeScriptVersion: false },
    plugins: ["@typescript-eslint", "drizzle"],
    extends: [
        "next/core-web-vitals",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
        "plugin:tailwindcss/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked"
    ],
    rules: {
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
        "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/only-throw-error": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-floating-promises": "error",
        "comma-dangle": ["warn", "never"],
        indent: ["off", 4, { SwitchCase: 1 }],
        "max-len": ["warn", { code: 9999 }],
        quotes: ["warn", "double", { avoidEscape: true }],
        "import/no-anonymous-default-export": "off",
        "sort-imports": ["error", { ignoreDeclarationSort: true }],
        "drizzle/enforce-update-with-where": ["error", { drizzleObjectName: ["db", "ctx.db"] }],
        "no-throw-literal": "off",
        "tailwindcss/classnames-order": "warn",
        "tailwindcss/no-contradicting-classname": "error",
        "tailwindcss/no-custom-classname": "error"
    },
    settings: {
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true
            }
        },
        tailwindcss: {
            callees: ["cn", "ucn", "clsx", "cva"]
        }
    }
}

module.exports = config
