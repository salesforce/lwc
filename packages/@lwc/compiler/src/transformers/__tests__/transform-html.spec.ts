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

it('should throw when processing an invalid HTML file', async () => {
    await expect(transform(`<html`, 'foo.html', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.html',
        message: expect.stringContaining('Invalid HTML syntax: eof-in-tag.'),
    });
});

it('should apply transformation for template file', async () => {
    const actual = `
        <template>
            <div>Hello</div>
        </template>
    `;
    const { code } = await transform(actual, 'foo.html', TRANSFORMATION_OPTIONS);

    expect(code).toContain('function tmpl');
});
