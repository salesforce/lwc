/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { rollup } from 'rollup';

import lwc from '../../index';

describe('stylesheetConfig', () => {
    it('should accept custom property resolver config', async () => {
        const RESOLVER_MODULE = 'myCssResolver';

        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/test/test.js'),
            plugins: [
                lwc({
                    stylesheetConfig: {
                        customProperties: {
                            resolution: {
                                type: 'module',
                                name: RESOLVER_MODULE,
                            },
                        },
                    },
                }),
            ],
            external: [RESOLVER_MODULE],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].imports).toEqual([RESOLVER_MODULE]);
    });
});

describe('templateConfig', () => {
    it('compile with preserveHtmlComments option', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/test/test.js'),
            plugins: [
                lwc({
                    preserveHtmlComments: true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        expect(output[0].code).toContain('Application container');
    });

    it('should accept disableSyntheticShadowSupport config flag', async () => {
        const bundle = await rollup({
            input: path.resolve(__dirname, 'fixtures/test/test.js'),
            plugins: [
                lwc({
                    disableSyntheticShadowSupport: true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        // This function takes no arguments, corresponding to the optimization used
        // for `disableSyntheticShadowSupport: true` by serialize.ts in @lwc/style-compiler
        expect(output[0].code).toContain('function stylesheet()');
    });
});
