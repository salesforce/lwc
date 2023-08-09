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

it('should throw when processing an invalid CSS file', async () => {
    await expect(transform(`<`, 'foo.css', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.css',
        message: expect.stringContaining('foo.css:1:1: Unknown word'),
    });
});

it('should apply transformation for stylesheet file', async () => {
    const actual = `
        :host {
            color: red;
        }

        div {
            background-color: red;
        }
    `;
    const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);

    expect(code).toContain('function stylesheet');
});

describe('custom properties', () => {
    it('should not transform var functions', async () => {
        const actual = `div { color: var(--bg-color); }`;
        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
        });

        expect(code).toContain('var(--bg-color)');
    });
});

describe('regressions', () => {
    it('should escape grave accents', async () => {
        const actual = `/* Comment with grave accents \`#\` */`;
        const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);

        expect(code).not.toContain('/*');
    });

    it('should escape backslash', async () => {
        const actual = `.foo { content: "x\\x"; }`;
        const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);

        expect(code).toContain('\\"x\\\\x\\"');
    });
});
