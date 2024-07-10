import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jest from 'eslint-plugin-jest';
import lwcInternal from '@lwc/eslint-plugin-lwc-internal';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import _import from 'eslint-plugin-import';
import header from 'eslint-plugin-header';
import { fixupPluginRules } from '@eslint/compat';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat
        .extends('eslint:recommended', 'plugin:@typescript-eslint/recommended-type-checked')
        .map((config) => ({
            ...config,
            files: ['**/*.ts', '**/*.mjs', '**/*.js', '**/*.only', '**/*.skip'],
        })),
    {
        files: ['**/*.ts', '**/*.mjs', '**/*.js', '**/*.only', '**/*.skip'],

        plugins: {
            jest,
            '@lwc/lwc-internal': lwcInternal,
            '@typescript-eslint': typescriptEslint,
            import: fixupPluginRules(_import),
            header,
        },

        linterOptions: {
            reportUnusedDisableDirectives: true,
        },

        languageOptions: {
            globals: {},
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: 'module',

            parserOptions: {
                project: true,
            },
        },

        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                },
            ],

            'block-scoped-var': 'error',
            'no-alert': 'error',
            'no-buffer-constructor': 'error',
            'no-console': 'error',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'error',
            'no-extra-label': 'error',
            'no-iterator': 'error',
            'no-lone-blocks': 'error',
            'no-proto': 'error',
            'no-new-require': 'error',

            'no-restricted-properties': [
                'error',
                {
                    object: 'arguments',
                    property: 'callee',
                    message: 'arguments.callee is deprecated',
                },
                {
                    object: 'global',
                    property: 'isFinite',
                    message: 'Please use Number.isFinite instead',
                },
                {
                    object: 'self',
                    property: 'isFinite',
                    message: 'Please use Number.isFinite instead',
                },
                {
                    object: 'window',
                    property: 'isFinite',
                    message: 'Please use Number.isFinite instead',
                },
                {
                    object: 'global',
                    property: 'isNaN',
                    message: 'Please use Number.isNaN instead',
                },
                {
                    object: 'self',
                    property: 'isNaN',
                    message: 'Please use Number.isNaN instead',
                },
                {
                    object: 'window',
                    property: 'isNaN',
                    message: 'Please use Number.isNaN instead',
                },
                {
                    property: '__defineGetter__',
                    message: 'Please use Object.defineProperty instead.',
                },
                {
                    property: '__defineSetter__',
                    message: 'Please use Object.defineProperty instead.',
                },
                {
                    object: 'Math',
                    property: 'pow',
                    message: 'Use the exponentiation operator (**) instead.',
                },
                {
                    object: 'globalThis',
                    property: 'lwcRuntimeFlags',
                    message: 'Use the bare global lwcRuntimeFlags instead.',
                },
            ],

            'no-self-compare': 'error',
            'no-undef-init': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-return': 'error',

            'prefer-const': [
                'error',
                {
                    destructuring: 'any',
                    ignoreReadBeforeAssign: true,
                },
            ],

            'template-curly-spacing': 'error',
            yoda: 'error',
            '@lwc/lwc-internal/no-invalid-todo': 'error',

            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'index',
                        'sibling',
                        'object',
                        'type',
                    ],
                },
            ],

            'no-restricted-imports': [
                'error',
                {
                    name: '@lwc/features',
                    importNames: ['lwcRuntimeFlags', 'runtimeFlags', 'default'],
                    message:
                        'Do not directly import runtime flags from @lwc/features. Use the global lwcRuntimeFlags variable instead.',
                },
            ],

            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        },
    },
    {
        files: [
            '**/__tests__/**',
            'packages/@lwc/*/scripts/**',
            'packages/@lwc/synthetic-shadow/index.js',
        ],

        languageOptions: {
            ecmaVersion: 5,
            sourceType: 'script',

            parserOptions: {
                project: './tsconfig.eslint.json',
            },
        },
    },
    ...compat.extends('plugin:@typescript-eslint/disable-type-checked').map((config) => ({
        ...config,
        files: ['**/jest.config.js', '**/rollup.config.js'],
    })),
    {
        files: [
            '**/scripts/**',
            '**/jest.config.js',
            'packages/@lwc/integration-tests/src/components/**/*.spec.js',
        ],

        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        files: ['packages/lwc/**'],

        rules: {
            'no-restricted-imports': 'off',
        },
    },
    {
        files: [
            'packages/@lwc/engine-core/**',
            'packages/@lwc/engine-dom/**',
            'packages/@lwc/synthetic-shadow/**',
        ],

        rules: {
            '@lwc/lwc-internal/no-global-node': 'error',
            'prefer-rest-params': 'off',
            'prefer-spread': 'off',
        },
    },
    {
        files: ['**/__tests__/**', '**/__mocks__/**', 'packages/@lwc/integration-karma/**'],

        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },

        rules: {
            'jest/no-focused-tests': 'error',
            'jest/valid-expect': 'error',
            'jest/valid-expect-in-promise': 'error',
        },
    },
    {
        files: ['packages/@lwc/integration-tests/**'],

        languageOptions: {
            globals: {
                $: true,
                browser: true,
            },
        },
    },
    {
        files: ['./*.js', '**/scripts/**', '**/jest.config.js'],

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },

        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['packages/@lwc/perf-benchmarks/**'],

        languageOptions: {
            globals: {
                after: true,
                before: true,
                benchmark: true,
                run: true,
            },
        },
    },
    {
        files: [
            'packages/@lwc/integration-tests/src/**/!(*.spec.js)',
            'packages/@lwc/integration-karma/test/**',
            'packages/@lwc/integration-karma/test-hydration/**',
        ],

        rules: {
            'header/header': 'off',
        },
    },
    {
        files: ['packages/@lwc/integration-karma/**'],

        languageOptions: {
            globals: {
                lwcRuntimeFlags: true,
            },
        },
    },
    ...compat.extends('plugin:@typescript-eslint/disable-type-checked').map((config) => ({
        ...config,
        files: ['**/.only'],
    })),
    {
        files: ['**/.only'],

        rules: {
            'header/header': 'off',
            '@lwc/lwc-internal/forbidden-filename': 'error',
        },
    },
    ...compat.extends('plugin:@typescript-eslint/disable-type-checked').map((config) => ({
        ...config,
        files: ['**/.skip'],
    })),
    {
        files: ['**/.skip'],

        rules: {
            'header/header': 'off',
            '@lwc/lwc-internal/forbidden-filename': 'off',
        },
    },
];
