/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TransformOptions } from '../../options';
import { transformSync } from '../transformer';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

describe('transformSync', () => {
    it('should throw when processing an invalid HTML file', () => {
        expect(() => transformSync(`<html`, 'foo.html', TRANSFORMATION_OPTIONS)).toThrow(
            'Invalid HTML syntax: eof-in-tag.'
        );
    });

    it('should apply transformation for template file', () => {
        const template = `
            <template>
                <div>Hello</div>
            </template>
        `;
        const { code } = transformSync(template, 'foo.html', TRANSFORMATION_OPTIONS);

        expect(code).toContain(`tmpl.stylesheets = []`);
    });

    it('should hoist static vnodes when enableStaticContentOptimization is set to true', () => {
        const template = `
            <template>
                <img src="http://www.example.com/image.png" crossorigin="anonymous">
            </template>
        `;
        const { code, warnings } = transformSync(template, 'foo.html', {
            enableStaticContentOptimization: true,
            ...TRANSFORMATION_OPTIONS,
        });

        expect(warnings).toHaveLength(0);
        expect(code).toMatch('<img');
    });

    it('should not hoist static vnodes when enableStaticContentOptimization is set to false', () => {
        const template = `
            <template>
                <img src="http://www.example.com/image.png" crossorigin="anonymous">
            </template>
        `;
        const { code, warnings } = transformSync(template, 'foo.html', {
            enableStaticContentOptimization: false,
            ...TRANSFORMATION_OPTIONS,
        });

        expect(warnings).toHaveLength(0);
        expect(code).toMatch(`api_element("img"`);
    });

    it('should hoist static vnodes by default', () => {
        const template = `
            <template>
                <img src="http://www.example.com/image.png" crossorigin="anonymous">
            </template>
        `;
        const { code, warnings } = transformSync(template, 'foo.html', TRANSFORMATION_OPTIONS);

        expect(warnings).toHaveLength(0);
        expect(code).toMatch('<img');
    });
});
