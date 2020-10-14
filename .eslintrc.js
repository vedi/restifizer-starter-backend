'use strict';

module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true,
    jest: true,
  },
  overrides: [
    {
      files: [
        '**/*.js',
      ],
      extends: ['airbnb-base'],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        'class-methods-use-this': 0,
        'function-paren-newline': 0,
        'no-else-return': 0,
        'no-param-reassign': 0,
        'no-restricted-properties': [2, {
          property: 'isForced',
          message: 'Remove me before committing, please.',
        }],
        'no-shadow': 'warn',
        'no-underscore-dangle': 0,
        'object-curly-newline': 0,
        strict: 0,
      },
      settings: {
        'import/resolver': {
          node: {
            moduleDirectory: [
              'node_modules',
              '.',
            ],
            extensions: ['.js', '.ts'],
          },
        },
      },
    },
    {
      files: [
        '**/*.ts',
      ],
      extends: ['airbnb-typescript/base'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 6,
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        'class-methods-use-this': 0,
        'import/prefer-default-export': 0,
        'import/named': 0, // https://github.com/typescript-eslint/typescript-eslint/issues/154
        'import/no-unresolved': 0,
        'no-else-return': 0,
        'no-param-reassign': 0,
        'no-restricted-properties': [2, {
          property: 'isForced',
          message: 'Remove me before committing, please.',
        }],
        'no-undef': 0, // https://github.com/typescript-eslint/typescript-eslint/issues/342
        'no-underscore-dangle': 0,
        'object-curly-newline': ['error',
          {
            multiline: true,
            consistent: true,
          },
        ],
      },
    },
  ],
};
