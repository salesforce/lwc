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
    },
    plugins,
});
