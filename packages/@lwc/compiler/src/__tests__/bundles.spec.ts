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
            name: 'typescript',
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
            name: 'typescript-typed',
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

describe('test css only module', () => {
    test('test inline only module', async () => {
        const customConfig = {
            name: 'css_only',
            files: {
                'css_only.css': readFixture('./css_only/css_only.css'),
            },
            outputConfig: {
                format: 'es',
            },
        };

        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const { success } = await compile(config);
        expect(success).toBe(true);
    });

    test('test inline only module', async () => {
        const customConfig = {
            name: 'css_only_with_relative',
            files: {
                'css_only_with_relative.css': readFixture(
                    './css_only_with_relative/css_only_with_relative.css'
                ),
                'other.css': readFixture('./css_only_with_relative/other.css'),
            },
            outputConfig: {
                format: 'es',
            },
        };

        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const result = await compile(config);
        const { success } = result;
        expect(success).toBe(true);
    });
});
