/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { afterEach, beforeEach, expect, vi, test } from 'vitest';
import { transformSync } from '@babel/core';
import plugin from '../index';

let spy;

beforeEach(() => {
    spy = vi.spyOn(console, 'warn');
});

afterEach(() => {
    spy!.mockReset();
});

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

    expect(spy!).toHaveBeenCalledOnce();
    expect(spy!).toHaveBeenCalledWith(
        'The namespace and name should both be non-empty strings. You may get unexpected behavior at runtime. Found: namespace="" and name=""'
    );
});
