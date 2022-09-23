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
const lwcFeatures = require('../../../../scripts/rollup/lwcFeatures');
const { version } = require('../package.json');

const banner = `/* proxy-compat-disable */`;
const footer = `/* version: ${version} */`;
const formats = ['es', 'cjs'];

const RENDERER_ENTRY_POINT = path.resolve(__dirname, '../src/renderer/index.ts');

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

async function genCreateRenderer() {
    const bundle = await rollup({
        input: RENDERER_ENTRY_POINT,

        plugins: [
            nodeResolve({
                resolveOnly: ['@lwc/shared'],
            }),
            ...sharedPlugins(),
        ],
    });
    const { output } = await bundle.generate({
        name: 'createRenderer',
        format: 'iife',
        exports: 'default', // only the default export
        esModule: false, // no need for `Object.defineProperty(exports, '__esModule', { value: true })`
    });
    const { code, modules } = output[0];

    return { code, files: Object.keys(modules) };
}

function resolveBaseRenderer() {
    // The renderer factory needs to be a pure function, with all of its dependencies.
    // The reasons for this are due to how Locker does sandboxing.

    // So we run Rollup inside of a Rollup plugin to accomplish this. This resolves all dependencies and
    // builds them as an IIFE.
    /*
        ...
        const rendererApi = {};
        export default function() { // createRendererFn
            return renderApi;
        }

        is transformed to:

        export default function() {
            var createRenderer = (function () {
                    ...
                const rendererApi = {};
                function idx() { // createRendererFn
                    return renderApi;
                }

                return idx;
            })();

            return createRenderer();
        }
     */
    return {
        name: 'resolve-base-renderer',

        async load(id) {
            if (id === RENDERER_ENTRY_POINT) {
                const { code, files } = await genCreateRenderer();

                // In watch mode, Rollup doesn't know by default that we care about `./renderer/index.ts` or
                // its dependencies. If we call `addWatchFile` within the transform hook, Rollup will watch these files.

                for (const fileName in files) {
                    this.addWatchFile(fileName);
                }

                return `export default function() {
                    ${code};

                    return createRenderer();
                }`;
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
        resolveBaseRenderer(), // needs to be before all plugins as it resolves the baseRenderer.
        nodeResolve({
            resolveOnly: [/^@lwc\//],
        }),
        ...sharedPlugins(),
        writeDistAndTypes(),
        lwcFeatures(),
    ],

    onwarn({ code, message }) {
        if (!process.env.ROLLUP_WATCH && code !== 'CIRCULAR_DEPENDENCY') {
            throw new Error(message);
        }
    },
};
