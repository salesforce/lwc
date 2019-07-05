/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../index';
import { readFixture, pretify } from './utils';

describe('dynamic imports', () => {
    it('external dynamic import works', async () => {
        const compilerResult = await compile({
            name: 'dynamic_imports',
            namespace: 'x',
            files: {
                'dynamic_imports.js': readFixture('dynamic_imports/dynamic_imports.js'),
                'dynamic_imports.html': readFixture('dynamic_imports/dynamic_imports.html'),
            },
            outputConfig: {
                compat: false,
                format: 'es',
            },
            experimentalDynamicComponent: {
                loader: '@custom/loader',
                strict: false,
            },
        });
        const { result } = compilerResult;

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-dynamic-component.js')));
    });
});
