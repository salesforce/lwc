/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../index';
import { pretify, readFixture } from './utils';

const BASE_CONFIG = {
    outputConfig: {
        minify: false,
        compat: false,
    },
    namespace: 'x',
};

describe('test typescript like bundle', () => {
    test('test typescript extension', async () => {
        const customConfig = {
            name: 'typescript.ts',
            files: {
                'typescript.ts': readFixture('./typescript/typescript.ts'),
                'typescript.html': readFixture('./typescript/typescript.html'),
            },
            outputConfig: {
                format: 'es',
            },
        };

        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const {
            result: { code },
        } = await compile(config);

        expect(pretify(code)).toBe(pretify(readFixture('expected-typescript-extension.js')));
    });

    test('test typescript grammar should fail', async () => {
        const customConfig = {
            name: 'typescript-typed.ts',
            files: {
                'typescript-typed.ts': readFixture('./typescript-typed/typescript-typed.ts'),
                'typescript-typed.html': readFixture('./typescript-typed/typescript-typed.html'),
            },
            outputConfig: {
                format: 'es',
            },
        };

        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const { success, diagnostics } = await compile(config);

        expect(success).toBe(false);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].message).toContain('SyntaxError: LWC1007');
    });
});
