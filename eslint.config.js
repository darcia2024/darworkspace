import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'tests/.tmp-*.mjs', 'coverage/**'],
  },

  // Browser code.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // The audit found 42 dead imports. tsconfig's noUnusedLocals catches locals;
      // this keeps unused function arguments visible too, minus the _ convention.
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],

      // Hook dependency mistakes are what produced the stale-closure PIN bug.
      'react-hooks/exhaustive-deps': 'warn',

      // react-hooks v6 adds two strict rules that flag patterns used all over this
      // codebase (effects that set state, refs read during render). They are real
      // debt worth paying down, but they are warnings so the gate stays usable.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',

      // This codebase leans on `any` in a few prop shims; flag it without failing.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',

      'no-empty': ['warn', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },

  // Node code: server, shared domain, build scripts, tests.
  {
    files: ['server/**/*.js', 'shared/**/*.js', 'scripts/**/*.js', 'tests/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
    },
  },
);
