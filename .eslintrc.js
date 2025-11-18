/**
 * ESLint Configuration
 * 
 * Note: A custom ESLint rule to prevent hardcoded routes can be added here.
 * For now, use `npm run check:links` to detect hardcoded routes.
 * 
 * To add a custom rule:
 * 1. Create eslint/rules/no-raw-routes.js
 * 2. Add it to the rules section below
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Custom rule for preventing hardcoded routes can be added here
    // For now, use `npm run check:links` script instead
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        // TypeScript-specific rules
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
  ],
};

