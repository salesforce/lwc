/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { bundle } from '../bundler';

describe('bundler', () => {
    test('throws when invoked without configurations', async () => {
        await expect(bundle()).rejects.toMatchObject({
            message: expect.stringContaining('Expected options object, received "undefined".'),
        });
    });

    test('does not return sourcemap by default', async () => {
        const result = await bundle({
            baseDir: '',
            name: 'cmp',
            namespace: 'c',
            files: {
                'cmp.js': 'let a = 1',
            },
            stylesheetConfig: {
                customProperties: {
                    allowDefinition: false,
                    resolution: { type: 'native' },
                },
            },
            outputConfig: {
                env: { NODE_ENV: 'development' },
                minify: false,
                compat: false,
                sourcemap: false,
            },
        });

        expect(result.map).toBeNull();
    });

    test('returns sourcemap when requested', async () => {
        const result = await bundle({
            baseDir: '',
            name: 'cmp',
            namespace: 'c',
            files: {
                'cmp.js': 'const a = 1;',
            },
            stylesheetConfig: {
                customProperties: {
                    allowDefinition: false,
                    resolution: { type: 'native' },
                },
            },
            outputConfig: {
                env: { NODE_ENV: 'development' },
                minify: false,
                compat: false,
                sourcemap: true,
            },
        });

        expect(result.map).not.toBeNull();
    });
});
