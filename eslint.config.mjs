/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import lwcInternal from '@lwc/eslint-plugin-lwc-internal';
import _import from 'eslint-plugin-import';
import header from 'eslint-plugin-header';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import gitignore from 'eslint-config-flat-gitignore';
import vitest from '@vitest/eslint-plugin';
import * as espree from 'espree';

import { PUBLIC_PACKAGES as publicPackageData } from './scripts/shared/packages.mjs';
// convert filepath to eslint glob
const PUBLIC_PACKAGES = publicPackageData.map(({ path }) => `${path}/**`);

// Workaround for plugin schema validation failing in eslint v9
// Ref: https://github.com/Stuk/eslint-plugin-header/issues/57#issuecomment-2378485611
header.rules.header.meta.schema = false;

export default tseslint.config(
    // ------------- //
    // Global config //
    // ------------- //

    gitignore(),
    {
        ignores: ['packages/**/fixtures/**/*.js'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        plugins: {
            '@lwc/lwc-internal': lwcInternal,
            import: _import,
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
                projectService: {},
            },
        },

        rules: {
            // Rules without config, sorted alphabetically by namespace, then rule
            '@lwc/lwc-internal/no-invalid-todo': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-base-to-string': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/unbound-method': 'off',
            'block-scoped-var': 'error',
            'no-alert': 'error',
            // Deprecated, replace with rule in eslint-plugin-n when removed
            'no-buffer-constructor': 'error',
            'no-console': 'error',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'error',
            'no-extra-label': 'error',
            'no-iterator': 'error',
            'no-lone-blocks': 'error',
            'no-proto': 'error',
            'no-self-compare': 'error',
            'no-undef-init': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-return': 'error',
            // Deprecated, replace with rule in @stylistic/eslint-plugin-js when removed
            'template-curly-spacing': 'error',
            yoda: 'error',

            // Rule with config, sorted alphabetically by namespace, then rule
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],
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
            'prefer-const': [
                'error',
                {
                    destructuring: 'any',
                    ignoreReadBeforeAssign: true,
                },
            ],
        },
    },
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        ...tseslint.configs.disableTypeChecked,
    },

    // -------------------------------- //
    // Scripts, tests, and config files //
    // -------------------------------- //
    // aka things that run in node and might still use `require`
    {
        files: [
            'commitlint.config.js',
            '**/scripts/**',
            '**/rollup.config.js',
            '**/rollup.config.mjs',
        ],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['**/scripts/**', 'packages/@lwc/integration-tests/src/components/**/*.spec.js'],

        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['packages/@lwc/integration-karma/**', 'packages/@lwc/integration-not-karma/**'],

        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.es2021,
            },
        },

        plugins: {
            vitest,
        },

        rules: {
            'vitest/no-focused-tests': 'error',
            'vitest/valid-expect': 'error',
            'vitest/valid-expect-in-promise': 'error',
            'vitest/no-conditional-tests': 'error',
            'vitest/no-done-callback': 'error',
            // Note that vitest's "no focused tests" rules do not cover `fit`/`fdescribe`
            // https://github.com/salesforce/lwc/issues/5106
            'no-restricted-globals': [
                'error',
                {
                    name: 'fdescribe',
                    message: 'Do not commit focused tests. Use `describe` instead.',
                },
                {
                    name: 'fit',
                    message: 'Do not commit focused tests. Use `it` instead.',
                },
            ],
        },
    },
    {
        files: ['**/__tests__/**'],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
            'vitest/no-focused-tests': 'error',
            'vitest/valid-expect-in-promise': 'error',
            'vitest/no-conditional-tests': 'error',
            'vitest/no-done-callback': 'error',
        },
    },
    {
        files: ['**/scripts/**'],
        rules: {
            'no-console': 'off',
        },
    },

    // ---------------------- //
    // Package-specific rules //
    // ---------------------- //
    {
        // All published files must have a copyright header
        files: PUBLIC_PACKAGES,
        ignores: PUBLIC_PACKAGES.flatMap((pkg) => [
            `${pkg}/vitest.config.mjs`,
            `${pkg}/src/__tests__/**`,
        ]),
        rules: {
            'header/header': [
                'error',
                'block',
                [
                    '',
                    {
                        pattern:
                            '^ \\* Copyright \\(c\\) \\d{4}, ([sS]alesforce.com, inc|Salesforce, Inc)\\.$',
                        // This copyright text should match the text used in the rollup config
                        template: ` * Copyright (c) ${new Date().getFullYear()}, Salesforce, Inc.`,
                    },
                    ' * All rights reserved.',
                    ' * SPDX-License-Identifier: MIT',
                    ' * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT',
                    ' ',
                ],
                1 /* newline after header */,
            ],
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
                ...globals.node,
            },
        },
    },
    {
        files: ['packages/@lwc/integration-not-karma/**'],

        languageOptions: {
            globals: {
                lwcRuntimeFlags: true,
                process: true,
                ...globals.browser,
            },
        },

        rules: {
            'no-var': 'off',
            'prefer-rest-params': 'off',
        },
    },
    {
        files: ['packages/@lwc/integration-karma/**'],

        languageOptions: {
            globals: {
                lwcRuntimeFlags: true,
                process: true,
                LWC: true,
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
        // We normally restrict importing @lwc/features, but we need to do so in these files
        files: ['packages/lwc/features.js', 'packages/lwc/features.d.ts'],
        rules: {
            'no-restricted-imports': 'off',
        },
    },
    {
        files: ['playground/**'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },

    // --------------------- //
    // Weird file extensions //
    // --------------------- //

    {
        // These are empty files used to help debug test fixtures
        files: ['**/.only', '**/.skip'],
        plugins: { '@lwc/lwc-internal': lwcInternal },
        languageOptions: {
            // Using the default eslint parser because typescript-eslint doesn't
            // seem to correctly support `extraFileExtensions`
            parser: espree,
            parserOptions: {
                extraFileExtensions: ['only', 'skip'],
            },
        },
        rules: {
            '@lwc/lwc-internal/forbidden-filename': 'error',
            // Disable all TS rules because they complain about the parser being espree
            ...Object.fromEntries(
                tseslint.configs.all
                    .flatMap((cfg) => Object.keys(cfg.rules ?? {}))
                    .map((rule) => [rule, 'off'])
            ),
        },
    },
    {
        files: ['**/.skip'],
        rules: {
            // We want to avoid accidentally committing .skip files, but sometimes there are
            // legitimate reasons to do so. So we complain when trying to commit, but not any
            // other time.
            '@lwc/lwc-internal/forbidden-filename':
                // eslint-disable-next-line no-undef
                process.env.npm_lifecycle_event === 'lint-staged' ? 'error' : 'off',
        },
    }
);
