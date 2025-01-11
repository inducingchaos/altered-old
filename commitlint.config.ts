/**
 *
 */

export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
        "type-enum": [
            2,
            "always",
            ["feat", "fix", "perf", "refactor", "style", "docs", "test", "chore", "ci", "revert", "build"]
        ]
    }
}
