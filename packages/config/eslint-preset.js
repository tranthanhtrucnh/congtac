// Preset ESLint dung chung (flat config, ESLint 9+).
// Cac app tu import va noi them rule rieng (Next.js plugin, Nest plugin...).
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: ["dist/**", ".next/**", "node_modules/**", "build/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
);
