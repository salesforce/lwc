/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { CompilerOptions } from '../../compiler/options';
import { transform } from '../transformer';

import { pretify } from '../../__tests__/utils';

const COMPILER_OPTIONS: CompilerOptions = {
    namespace: 'x',
    name: 'foo',
    files: {},
};

it('should apply transformation for valid javascript file', async () => {
    const actual = `
        import { LightningElement } from 'lwc';
        export default class Foo extends LightningElement {}
    `;

    const expected = `
        import _tmpl from "./foo.html";
        import { registerComponent as _registerComponent } from "lwc";
        import { LightningElement } from 'lwc';
        class Foo extends LightningElement {}
        export default _registerComponent(Foo, {
            tmpl: _tmpl
        });
    `;

    const { code } = await transform(actual, 'foo.js', COMPILER_OPTIONS);
    expect(pretify(code)).toBe(pretify(expected));
});

it('should throw when processing an invalid javascript file', async () => {
    await expect(
        transform(`const`, 'foo.js', COMPILER_OPTIONS),
    ).rejects.toMatchObject({
        filename: 'foo.js',
        message: expect.stringContaining('foo.js: Unexpected token (1:5)'),
    });
});

it('allows dynamic imports', async () => {
    const actual = `
        export function test() {
            return import('/test');
        }
    `;

    const expected = `
        export function test() {
            return import('/test');
        }
    `;

    const { code } = await transform(actual, 'foo.js', COMPILER_OPTIONS);
    expect(pretify(code)).toBe(pretify(expected));
});
