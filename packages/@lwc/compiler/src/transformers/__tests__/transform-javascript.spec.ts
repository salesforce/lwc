/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { TransformOptions } from '../../options';
import { transform } from '../transformer';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

function stripWhitespace(string: string) {
    return string.replace(/\s/g, '');
}

it('should throw when processing an invalid javascript file', async () => {
    await expect(transform(`const`, 'foo.js', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.js',
        message: expect.stringContaining('foo.js: Unexpected token (1:5)'),
    });
});

it('should apply transformation for valid javascript file', async () => {
    const actual = `
        import { LightningElement } from 'lwc';
        export default class Foo extends LightningElement {}
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);

    expect(code).toMatch(/import \w+ from "\.\/foo.html";/);
    expect(code).toContain('registerComponent');
});

it('should transform class fields', async () => {
    const actual = `
        export class Test {
            foo;
        }
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);

    expect(code).not.toContain('foo;');
});

it('should object spread', async () => {
    const actual = `
        export const test = { ...a, b: 1 }
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);

    expect(code).toContain('b: 1');
    expect(code).not.toContain('...a');
});

it('should transform unforgeables when Lightning Web Security is on', async () => {
    const actual = `
        export const test = window.location.href;
    `;
    const { code } = await transform(actual, 'foo.js', {
        ...TRANSFORMATION_OPTIONS,
        enableLightningWebSecurityTransforms: true,
    });

    expect(code).toContain(
        '(window === globalThis || window === document ? location : window.location).href'
    );
});

it('should not transform unforgeables when Lightning Web Security is off', async () => {
    const actual = `export const test = window.location.href;`;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
    expect(stripWhitespace(code)).toMatch(stripWhitespace(actual));
});

it('should transform async await functions when Lightning Web Security is on', async () => {
    const actual = `
        export async function foo() {
            await bar();
        }
    `;
    const { code } = await transform(actual, 'foo.js', {
        ...TRANSFORMATION_OPTIONS,
        enableLightningWebSecurityTransforms: true,
    });

    expect(code).toContain('_asyncToGenerator');
});

it('should not transform async await functions when Lightning Web Security is off', async () => {
    const actual = `
        export async function foo() {
            await bar();
        }
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
    expect(stripWhitespace(code)).toMatch(stripWhitespace(actual));
});

it('should transform async generator functions when Lightning Web Security is on', async () => {
    const actual = `
        async function* agf() {
            await 1;
            yield 2;
        }
    `;
    const { code } = await transform(actual, 'foo.js', {
        ...TRANSFORMATION_OPTIONS,
        enableLightningWebSecurityTransforms: true,
    });
    expect(code).toContain('_wrapAsyncGenerator');
});

it('should not transform async generator functions when Lightning Web Security is off', async () => {
    const actual = `
        async function* agf() {
            await 1;
            yield 2;
        }
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
    expect(stripWhitespace(code)).toMatch(stripWhitespace(actual));
});

it('should transform async generator functions when Lightning Web Security is on', async () => {
    const actual = `
        async function* foo() {
            yield 1;
            yield 2;
        }
      
        (async function() {
            for await (const num of foo()) {
                console.log(num);
                break;
            }
        })();
    `;
    const { code } = await transform(actual, 'foo.js', {
        ...TRANSFORMATION_OPTIONS,
        enableLightningWebSecurityTransforms: true,
    });

    expect(code).toContain('_asyncIterator');
});
