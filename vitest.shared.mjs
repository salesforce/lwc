import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['**/*.{test,spec}.{mjs,js,ts}'],
        snapshotFormat: {
            printBasicPrototype: true,
            callToJSON: true,
        },
    },
});
