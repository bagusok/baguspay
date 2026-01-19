import { config } from "@repo/eslint-config/react-internal";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  ...config,
  {
    plugins: {
      "unused-imports": eslintPluginUnusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
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
