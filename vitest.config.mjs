import { defineConfig } from 'vitest/config';

// The root vitest.config.mjs should only define workspace-level configuration, such as code coverage
// See: https://github.com/vitest-dev/vitest/discussions/3852
export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            exclude: [
                // Ignore test files, config files, scripts, deps, and generated files
                '**/*.config.*',
                '**/.nx-cache/**',
                '**/.rollup.cache/**',
                '**/__tests__/**',
                '**/dist/**',
                '**/node_modules/**',
                '**/scripts/**',
                '**/vitest.*',
                // Ignore browser-only modules which are only lightly tested in unit tests
                // These are mostly tested in integration/karma tests
                '**/packages/@lwc/aria-reflection/**',
                '**/packages/@lwc/engine-dom/**',
                '**/packages/@lwc/engine-core/**',
                '**/packages/@lwc/synthetic-shadow/**',
                // Ignore test packages
                '**/packages/@lwc/integration-karma/**',
                '**/packages/@lwc/integration-tests/**',
                '**/packages/@lwc/integration-types/**',
                '**/packages/@lwc/perf-benchmarks-components/**',
                '**/packages/@lwc/perf-benchmarks/**',
                '**/playground/**',
                // This just re-exports other packages
                '**/packages/lwc/**',
            ],
            thresholds: {
                // SSR compiler/runtime is relatively newer, so has lower thresholds for now
                '**/packages/@lwc/ssr-*/**': {
                    branches: 90,
                    functions: 65,
                    lines: 85,
                    statements: 85,
                },

                '!**/packages/@lwc/ssr-*/**': {
                    branches: 95,
                    functions: 95,
                    lines: 95,
                    statements: 95,
                },
            },
            reporter: [
                'clover',
                'html',
                'json',
                'lcov',
                'text',
                ['text', { file: 'coverage.txt' }],
            ],
        },
    },
});
