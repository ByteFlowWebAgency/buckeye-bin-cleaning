import js from '@eslint/js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  js.configs.recommended,
  reactRecommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['node_modules/', 'dist/', 'build/', '.next/', 'public/'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
    },
    rules: {
      quotes: ['error', 'double', { avoidEscape: true }],

      indent: ['error', 2],

      semi: ['error', 'always'],

      'no-unused-vars': 'warn',

      'object-curly-spacing': ['error', 'always'],

      'react/jsx-curly-spacing': ['error', { when: 'always', children: true }],

      'react/jsx-pascal-case': 'error',

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],

      'prefer-arrow-callback': 'error',

      'arrow-spacing': ['error', { before: true, after: true }],

      'comma-spacing': ['error', { before: false, after: true }],

      'keyword-spacing': ['error', { before: true, after: true }],

      'space-infix-ops': 'error',

      'block-spacing': 'error',

      'function-paren-newline': ['error', 'consistent'],

      'template-curly-spacing': ['error', 'always'],
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