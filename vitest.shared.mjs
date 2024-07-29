import { defineConfig } from 'vitest/config';
import pkg from './package.json';

export default defineConfig({
    test: {
        globals: true,
        include: ['**/*.{test,spec}.{mjs,js,ts}'],
        snapshotFormat: {
            printBasicPrototype: true,
            callToJSON: true,
        },
    },
    define: {
        'process.env.LWC_VERSION': JSON.stringify(pkg.version),
    },
});
