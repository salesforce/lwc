/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { TransformerErrors } from '@lwc/errors';
import { APIVersion, LOWEST_API_VERSION } from '@lwc/shared';
import { TransformOptions } from '../../options';
import { transform, transformSync } from '../transformer';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

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

it('should provide helpful error for decorator outside of LightningElement in v59', async () => {
    const actual = `
        import { track } from 'lwc'
        class Foo {
          @track bar = 'baz';
        }
    `;
    let errored = false;
    try {
        transformSync(actual, 'foo.js', {
            ...TRANSFORMATION_OPTIONS,
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
    } catch (err) {
        errored = true;
        expect((err as any).code).toEqual(TransformerErrors.JS_TRANSFORMER_DECORATOR_ERROR.code);
        expect((err as any).message).toContain(
            'Decorators like @api, @track, and @wire are only supported in LightningElement classes.'
        );
    }

    if (!errored) {
        fail('Expected an error to be thrown');
    }
});

it('no error for decorator outside of LightningElement in v58', async () => {
    const actual = `
        import { track } from 'lwc'
        class Foo {
          @track bar = 'baz';
        }
    `;
    const { code } = transformSync(actual, 'foo.js', {
        ...TRANSFORMATION_OPTIONS,
        apiVersion: LOWEST_API_VERSION,
    });
    expect(code).toContain('registerDecorators');
});
