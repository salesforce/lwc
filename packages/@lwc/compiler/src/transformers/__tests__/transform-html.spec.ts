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

        expect(code).toContain(`tmpl.stylesheets = [];`);
    });

    it('should serialize the template with the correct scopeToken', () => {
        const template = `
            <template>
                <div>Hello</div>
            </template>
        `;
        const { code } = transformSync(template, 'foo.html', {
            namespace: 'ns',
            name: 'foo',
        });

        expect(code).toContain(`tmpl.stylesheetToken = "ns-foo_foo";`);
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

    it('should provide custom renderer hooks when config specified', () => {
        const template = `
            <template>
                <svg aria-hidden="true" class="slds-icon" title="when needed">
                    <use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#case"></use>
                </svg>
            </template>
        `;
        const { code, warnings } = transformSync(template, 'foo.html', {
            customRendererConfig: {
                directives: [],
                elements: [
                    {
                        tagName: 'use',
                        namespace: 'http://www.w3.org/2000/svg',
                        attributes: ['href', 'xlink:href'],
                    },
                ],
            },
            ...TRANSFORMATION_OPTIONS,
        });
        expect(warnings).toHaveLength(0);
        expect(code).toMatch('renderer: renderer');
    });

    it('should not provide custom renderer hooks when no config specified', () => {
        const template = `
            <template>
                <svg aria-hidden="true" class="slds-icon" title="when needed">
                    <use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#case"></use>
                </svg>
            </template>
        `;
        const { code, warnings } = transformSync(template, 'foo.html', TRANSFORMATION_OPTIONS);
        expect(warnings).toHaveLength(0);
        expect(code).not.toMatch('renderer: renderer');
    });

    describe('dynamic components', () => {
        it('should allow dynamic components when enableDynamicComponents is set to true', () => {
            const template = `
                <template>
                    <lwc:component lwc:is={ctor}></lwc:component>
                </template>
            `;
            const { code, warnings } = transformSync(template, 'foo.html', {
                enableDynamicComponents: true,
                ...TRANSFORMATION_OPTIONS,
            });

            expect(warnings).toHaveLength(0);
            expect(code).toContain('api_dynamic_component');
        });

        it('should not allow dynamic components when enableDynamicComponents is set to false', () => {
            const template = `
                <template>
                    <lwc:component lwc:is={ctor}></lwc:component>
                </template>
            `;
            expect(() =>
                transformSync(template, 'foo.html', {
                    enableDynamicComponents: false,
                    ...TRANSFORMATION_OPTIONS,
                })
            ).toThrow('LWC1188: Invalid dynamic components usage');
        });

        it('should allow deprecated dynamic components when experimentalDynamicDirective is set to true', () => {
            const template = `
                <template>
                    <x-dynamic lwc:dynamic={ctor}></x-dynamic>
                </template>
            `;
            const { code, warnings } = transformSync(template, 'foo.html', {
                experimentalDynamicDirective: true,
                ...TRANSFORMATION_OPTIONS,
            });

            expect(warnings).toHaveLength(1);
            expect(warnings?.[0]).toMatchObject({
                message: expect.stringContaining('lwc:dynamic directive is deprecated'),
            });
            expect(code).toContain('api_deprecated_dynamic_component');
        });

        it('should not allow dynamic components when experimentalDynamicDirective is set to false', () => {
            const template = `
                <template>
                    <x-dynamic lwc:dynamic={ctor}></x-dynamic>
                </template>
            `;
            expect(() =>
                transformSync(template, 'foo.html', {
                    experimentalDynamicDirective: false,
                    ...TRANSFORMATION_OPTIONS,
                })
            ).toThrowErrorMatchingInlineSnapshot(
                '"LWC1128: Invalid lwc:dynamic usage. The LWC dynamic directive must be enabled in order to use this feature."'
            );
        });
    });
});
