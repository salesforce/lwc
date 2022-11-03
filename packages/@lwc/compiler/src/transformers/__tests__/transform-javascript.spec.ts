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

describe('babel decorator trasform', () => {
    it('basic use case', async () => {
        const actual = `
          import { LightningElement, track, api } from 'lwc';
          export default class Foo extends LightningElement {
            @track
            foo = {};
          }
        `;
        const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
        expect(code).toMatchSnapshot();
    });

    it('value initialized in connectedCallback', async () => {
        const actual = `
          import { LightningElement, track, api } from 'lwc';
          export default class Foo extends LightningElement {
            @track
            foo;

            connectedCallback() {
                this.foo = {foo: 'bar'};
            }
          }
        `;
        const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
        expect(code).toMatchSnapshot();
    });

    it('multiple tracked properties', async () => {
        const actual = `
        import { LightningElement, api, track } from 'lwc';
        export default class Properties extends LightningElement {
            @track
            prop = 0;

            @track
            obj = { value: 0 };

            @track
            nestedObj = {
                value: {
                    nestedValue: 0,
                },
            };

            @track
            array = [1, 2, 3];

            @api
            mutateCmp(cb) {
                cb(this);
            }
        }`;
        const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
        expect(code).toMatchSnapshot();
    });
});
