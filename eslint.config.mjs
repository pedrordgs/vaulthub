import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintPluginYml from "eslint-plugin-yml";
import json from "@eslint/json";
import yamlEslintParser from "yaml-eslint-parser";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // JSON linting - must come after TypeScript config to override
  json.configs["recommended"],
  {
    files: ["*.json"],
    rules: {
      // Disable TypeScript rules for JSON files
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  // YAML linting
  ...eslintPluginYml.configs["flat/recommended"],
  {
    files: ["*.yml", "*.yaml"],
    languageOptions: {
      parser: yamlEslintParser,
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Coverage and build artifacts
    "coverage/**",
    "node_modules/**",
    // Ignore package-lock.json from linting
    "package-lock.json",
    // Ignore editor-specific configuration files
    ".vscode/**",
  ]),
  // Allow CommonJS require() in .js files (for Jest tests)
  // This must be last to override TypeScript rules
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Specifically allow require() in test files
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
