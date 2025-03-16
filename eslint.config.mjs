import js from '@eslint/js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  reactRecommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['node_modules/', 'dist/', 'build/', '.next/', 'public/'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      quotes: ['error', 'double', { avoidEscape: true }],

      indent: ['error', 2],

      semi: ['error', 'always'],

      'object-curly-spacing': ['error', 'always'],

      'arrow-spacing': ['error', { before: true, after: true }],

      'comma-spacing': ['error', { before: false, after: true }],

      'keyword-spacing': ['error', { before: true, after: true }],

      'space-infix-ops': 'error',

      'block-spacing': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];