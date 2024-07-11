import jest from 'eslint-plugin-jest';
import lwcInternal from '@lwc/eslint-plugin-lwc-internal';
import _import from 'eslint-plugin-import';
import header from 'eslint-plugin-header';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: [
            '**/node_modules/',
            '**/dist/',
            '**/coverage/',
            '**/fixtures/',
            '**/public/',
            '**/__benchmarks_results__/',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        files: ['**/*.ts', '**/*.mjs', '**/*.js'],

        plugins: {
            '@lwc/lwc-internal': lwcInternal,
            import: fixupPluginRules(_import),
            header,
        },

        linterOptions: {
            reportUnusedDisableDirectives: true,
        },

        languageOptions: {
            globals: {
                ...globals.es2021,
            },

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
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        ...tseslint.configs.disableTypeChecked,
    },
    {
        files: [
            'commitlint.config.js',
            '**/jest.config.cjs',
            'packages/@lwc/perf-benchmarks-components/**',
            '**/scripts/**',
            '**/jest.config.js',
        ],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
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
                ...globals.es2021,
            },
        },

        plugins: {
            jest,
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
                ...globals.browser,
                ...globals.mocha,
                ...globals.node,
            },
        },
    },
    {
        files: ['**/scripts/**', '**/jest.config.js'],
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
                browser: true,
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['packages/@lwc/perf-benchmarks-components/**'],

        languageOptions: {
            globals: {
                browser: true,
            },
        },
    },
    {
        files: ['packages/@lwc/integration-karma/**'],

        languageOptions: {
            globals: {
                lwcRuntimeFlags: true,
                process: true,
                LWC: true,
                spyOnAllFunctions: true,
                TestUtils: true,
                ...globals.browser,
                ...globals.jasmine,
            },
        },

        rules: {
            'no-var': 'off',
            'prefer-rest-params': 'off',
        },
    },
    {
        files: ['packages/@lwc/synthetic-shadow/**'],

        languageOptions: {
            globals: {
                process: true,
                ...globals.browser,
            },
        },
    },
    {
        files: ['**/rollup.config.js'],
        languageOptions: {
            globals: {
                process: true,
            },
        },
    },
    {
        files: ['playground/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        // These are empty files used to help debug test fixtures
        files: ['**/.only'],
        plugins: { '@lwc/lwc-internal': lwcInternal },
        rules: {
            '@lwc/lwc-internal/forbidden-filename': 'error',
        },
    },
    {
        // These are empty files used to help debug test fixtures
        files: ['**/.skip'],
        plugins: { '@lwc/lwc-internal': lwcInternal },
        rules: {
            '@lwc/lwc-internal/forbidden-filename': 'off',
        },
    },
];
