/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../index';
import { readFixture, pretify } from './utils';

describe('smoke test for babel transform', () => {
    it('should not transform ES2015 features in non-compat mode', async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture('namespaced_folder/babel/babel-es2015.js'),
            },
            outputConfig: { format: 'es' },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-babel-es2015.js')));
    });

    it('should transform ES2015 features to ES5 in compat mode', async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture('namespaced_folder/babel/babel-es2015.js'),
            },
            outputConfig: {
                compat: true,
                format: 'es',
            },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-babel-es2015-compat.js')));
    });

    it('should not transform ESNext features to ES2015 in non-compat mode', async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture('namespaced_folder/babel/babel-esnext.js'),
            },
            outputConfig: { format: 'es' },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-babel-esnext.js')));
    });

    it('should transform ESNext features to ES5 in compat mode', async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture('namespaced_folder/babel/babel-esnext.js'),
            },
            outputConfig: {
                compat: true,
                format: 'es',
            },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-babel-esnext-compat.js')));
    });
});
