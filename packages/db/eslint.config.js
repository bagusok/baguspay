import { config } from "@repo/eslint-config/react-internal";

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
      "**/utils.ts",
    ],
  },
];
