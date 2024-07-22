import { defineConfig } from 'vitest/config';
import { plugins } from './scripts/rollup/rollup.config';

export default defineConfig({
    test: {
        globals: true,
        include: ['**/*.{test,spec}.{js,ts}'],
        snapshotFormat: {
            printBasicPrototype: true,
            callToJSON: true,
        },
        coverage: {
            exclude: [
                '/node_modules/',
                '/fixtures/',
                '/dist/',
                // Ignore helper files like test-utils.ts that might exist alongside spec files
                '/__tests__/',
            ],
            thresholds: {
                branches: 80,
                functions: 90,
                lines: 90,
            },
            reporter: ['clover', 'json', 'lcov', 'text', ['text', { file: 'coverage.txt' }]],
        },
    },
    plugins,
});
