import { defineConfig } from 'vitest/config';

// The root vitest.config.mjs should only define workspace-level configuration, such as code coverage
// See: https://github.com/vitest-dev/vitest/discussions/3852
export default defineConfig({
    test: {
        projects: [
            'packages/@lwc/babel-plugin-component',
            'packages/@lwc/compiler',
            'packages/@lwc/engine-core',
            'packages/@lwc/engine-dom',
            'packages/@lwc/engine-server',
            'packages/@lwc/errors',
            'packages/@lwc/features',
            'packages/@lwc/module-resolver',
            'packages/@lwc/rollup-plugin',
            'packages/@lwc/shared',
            'packages/@lwc/signals',
            'packages/@lwc/ssr-compiler',
            'packages/@lwc/ssr-runtime',
            'packages/@lwc/style-compiler',
            'packages/@lwc/template-compiler',
            'packages/@lwc/wire-service',
            'packages/lwc',
        ],
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
                // These are mostly tested in integration tests
                '**/packages/@lwc/aria-reflection/**',
                '**/packages/@lwc/engine-dom/**',
                '**/packages/@lwc/engine-core/**',
                '**/packages/@lwc/synthetic-shadow/**',
                // TODO [#5272]: add tests
                '**/packages/@lwc/ssr-client-utils/**',
                // Ignore test packages
                '**/packages/@lwc/integration-karma/**',
                '**/packages/@lwc/integration-not-karma/**',
                '**/packages/@lwc/integration-tests/**',
                '**/packages/@lwc/integration-types/**',
                '**/packages/@lwc/perf-benchmarks-components/**',
                '**/packages/@lwc/perf-benchmarks/**',
                '**/playground/**',
                // This just re-exports other packages
                '**/packages/lwc/**',
            ],
            thresholds: {
                // TODO [#5564]: Restore to 95 across the board
                branches: 90,
                functions: 89,
                lines: 93,
                statements: 90,
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
