/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

// Executing the script to ensure the tsconfig paths are up to date
await import('../../scripts/update-paths.js');

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('rollup').RollupOptions} */
export default {
    input: join(__dirname, 'main.ts'),

    output: {
        file: join(__dirname, 'dist/main.js'),
        format: 'esm',
        sourcemap: true,
    },

    plugins: [
        typescript(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
            preventAssignment: true,
        }),
        lwc(),
        serve({
            contentBase: __dirname,
            open: false,
            port: process.env.PORT ?? 3000,
        }),
        livereload(join(__dirname, 'dist')),
    ],
};
