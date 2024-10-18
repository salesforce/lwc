// @ts-check

import path from 'node:path';
import { defineConfig } from 'vitest/config';
import plugins from './vitest-plugins';
import test from './vitest-config';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
    plugins: plugins('test-hydration'),
    test: {
        name: 'lwc-karma:test-hydration',
        dir: 'test-hydration',
        include: ['**/*.spec.js'],
        exclude: ['**/__screenshots__/**'],
        globals: true,
        alias: [
            {
                find: 'test-utils',
                replacement: path.resolve(__dirname, 'vitest-helpers/test-utils.ts'),
            },
            {
                find: 'test-hydrate',
                replacement: path.resolve(__dirname, 'vitest-helpers/test-hydrate.ts'),
            },
        ],
        setupFiles: ['./vitest-setup/index.ts'],
        env: {
            NODE_ENV: 'development',
            ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION: process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
            DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE:
                process.env.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
        },
        isolate: false,
        ...test,
    },
});
