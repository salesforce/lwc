/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { rollup } from 'rollup';
import compat from 'rollup-plugin-compat';

import lwc from '../../index';

describe('integration', () => {
    describe('typescript', () => {
        it(`resolves and transform .ts files`, async () => {
            const bundle = await rollup({
                input: path.resolve(__dirname, 'fixtures/typescript/typescript.ts'),
                plugins: [lwc()],
            });

            const result = await bundle.generate({
                format: 'esm',
            });

            const { code } = result.output[0];
            expect(code).toContain('class TypeScript');
            expect(code).toContain('registerComponent');
        });
    });

    describe('compat', () => {
        it('should be compatible with compat plugin', async () => {
            const bundle = await rollup({
                input: path.resolve(__dirname, 'fixtures/javascript/javascript.js'),
                plugins: [lwc(), compat()],
            });

            const result = await bundle.generate({
                format: 'esm',
            });

            const { code } = result.output[0];
            expect(code).not.toContain('class JavaScript');
            expect(code).toContain('var JavaScript');
            expect(code).toContain('registerComponent');
            expect(code).toContain('setKey');
        });
    });
});
