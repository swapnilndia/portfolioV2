import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Formatting, missing semicolons, etc (no logic change)
        "refactor", // Code change that is neither a fix nor a feature
        "perf", // Performance improvement
        "test", // Adding or updating tests
        "chore", // Build process or tooling changes
        "ci", // CI configuration changes
        "build", // Changes to build system or external dependencies
        "revert", // Revert a previous commit
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
  },
};

export default config;
