import inspector from 'node:inspector';
import { defineConfig } from 'vitest/config';
import pkg from './package.json';

export default defineConfig({
    test: {
        // Don't time out if we detect a debugger attached
        testTimeout: inspector.url() ? 2147483647 : undefined,
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
