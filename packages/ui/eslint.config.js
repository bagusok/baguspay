import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.nuxt/**",
      "**/.cache/**",
      "**/.out/**",
      "**/.vercel/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/.git/**",
      "**/.github/**",
      ".eslintrc.js",
    ],
  },
];
