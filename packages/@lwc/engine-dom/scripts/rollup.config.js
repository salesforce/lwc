/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const path = require('path');
const { rollup } = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const typescript = require('../../../../scripts/rollup/typescript');
const writeDistAndTypes = require('../../../../scripts/rollup/writeDistAndTypes');
const { version } = require('../package.json');

const banner = `/* proxy-compat-disable */`;
const footer = `/* version: ${version} */`;
const formats = ['es', 'cjs'];

const RENDERER_REPLACEMENT_STRING = 'process.env.RENDERER';

// These plugins are used both by the main Rollup build as well as our sub-Rollup build (injectInlineRenderer).
function sharedPlugins() {
    return [
        typescript(),
        replace({
            values: {
                'process.env.IS_BROWSER': 'true',
            },
            preventAssignment: true,
        }),
    ];
}

function injectInlineRenderer() {
    // The renderer in the renderer factory needs to be inlined in the function, with all of its dependencies.
    // The reasons for this are due to how Locker does sandboxing.
    // So we run Rollup inside of a Rollup plugin to accomplish this. This resolves all dependencies and
    // builds them as an IIFE, which can then be injected into the source as process.env.RENDERER.
    return {
        name: 'inject-inline-renderer',

        async transform(source) {
            if (source.includes(RENDERER_REPLACEMENT_STRING)) {
                const bundle = await rollup({
                    input: path.resolve(__dirname, '../src/renderer/index.ts'),

                    plugins: [
                        // In the inline renderer, we only allow certain dependencies. Any others should fail
                        nodeResolve({
                            resolveOnly: ['@lwc/shared'],
                        }),
                        ...sharedPlugins(),
                    ],
                });
                const { output } = await bundle.generate({
                    name: 'renderer',
                    format: 'iife',
                    esModule: false, // no need for `Object.defineProperty(exports, '__esModule', { value: true })`
                });
                const { code, modules } = output[0];

                // In watch mode, Rollup doesn't know by default that we care about `./renderer/index.ts` or
                // its dependencies. If we call `addWatchFile` within the transform hook, Rollup will watch these files.
                for (const filename of Object.keys(modules)) {
                    this.addWatchFile(filename);
                }

                // The IIFE will contain the string `var renderer = `, which we don't actually need. We just need the
                // part after, which is the actual IIFE (e.g. `(function () { /* code */ })()`)
                return source.replace(
                    RENDERER_REPLACEMENT_STRING,
                    code.replace('var renderer = ', '')
                );
            }
        },
    };
}

module.exports = {
    input: path.resolve(__dirname, '../src/index.ts'),

    output: formats.map((format) => {
        return {
            file: `engine-dom${format === 'cjs' ? '.cjs' : ''}.js`,
            format,
            banner: banner,
            footer: footer,
        };
    }),

    plugins: [
        nodeResolve({
            resolveOnly: [/^@lwc\//],
        }),
        ...sharedPlugins(),
        writeDistAndTypes(),
        injectInlineRenderer(),
    ],

    onwarn({ code, message }) {
        if (!process.env.ROLLUP_WATCH && code !== 'CIRCULAR_DEPENDENCY') {
            throw new Error(message);
        }
    },
};
