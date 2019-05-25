/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../index';
import { readFixture, pretify } from './utils';

describe('styles', () => {
    it('external import works', async () => {
        const { result } = await compile({
            name: 'external_style',
            namespace: 'x',
            files: {
                'external_style.js': readFixture('external_style/external_style.js'),
                'external_style.html': readFixture('external_style/external_style.html'),
                'external_style.css': readFixture('external_style/external_style.css'),
            },
            outputConfig: {
                compat: false,
                format: 'es',
            },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-external-styles.js')));
    });
});
