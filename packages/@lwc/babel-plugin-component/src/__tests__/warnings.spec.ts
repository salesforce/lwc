/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { afterEach, beforeEach, expect, vi, test, afterAll } from 'vitest';
import { transformSync } from '@babel/core';
import plugin from '../index';

let spy;

beforeEach(() => {
    spy = vi.spyOn(console, 'warn');
});

afterEach(() => {
    spy!.mockReset();
});

afterAll(() => spy!.mockRestore());

test('warns on missing name/namespace', () => {
    const source = `
        import { LightningElement } from 'lwc';
        export default class extends LightningElement {};
    `;

    const { code } = transformSync(source, {
        babelrc: false,
        configFile: false,
        filename: `foo.js`,
        plugins: [
            [
                plugin,
                {
                    namespace: '',
                    name: '',
                },
            ],
        ],
    })!;

    // compilation works successfully
    expect(code).toBeTypeOf('string');

    expect(spy!).toHaveBeenCalledExactlyOnceWith(
        'The namespace and name should both be non-empty strings. You may get unexpected behavior at runtime. Found: namespace="" and name=""'
    );
});
