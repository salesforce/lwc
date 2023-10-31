/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { APIVersion, noop } from '@lwc/shared';
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

    it('should serialize the template with the correct scopeToken - API version 58', () => {
        const template = `
            <template>
                <div>Hello</div>
            </template>
        `;
        const { code } = transformSync(template, 'foo.html', {
            namespace: 'ns',
            name: 'foo',
            apiVersion: APIVersion.V58_244_SUMMER_23,
        });

        expect(code).toContain(`tmpl.stylesheetToken = "ns-foo_foo";`);
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

        expect(code).toContain(`tmpl.stylesheetToken = "lwc-143n22jptum";`);
    });

    describe('enableStaticContentOptimization: ', () => {
        const configs = [
            {
                name: 'undefined',
                config: { enableStaticContentOptimization: undefined },
                expected: false,
            },
            { name: 'false', config: { enableStaticContentOptimization: false }, expected: false },
            { name: 'true', config: { enableStaticContentOptimization: true }, expected: true },
            { name: 'unspecified', config: {}, expected: true },
        ];
        configs.forEach(({ name, config, expected }) => {
            it(name, () => {
                const template = `<template><img src="http://example.com/img.png" crossorigin="anonymous"></template>`;
                const { code, warnings } = transformSync(template, 'foo.html', config);
                expect(warnings!.length).toBe(0);
                if (expected) {
                    expect(code).toContain('<img');
                } else {
                    expect(code).not.toContain('<img');
                }
            });
        });
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

    it('should return scope tokens', () => {
        const template = `
            <template>
                <div>Hello</div>
            </template>
        `;
        const { cssScopeTokens } = transformSync(template, 'foo.html', TRANSFORMATION_OPTIONS);

        expect(cssScopeTokens!.sort()).toEqual([
            'lwc-1hl7358i549',
            'lwc-1hl7358i549-host',
            'x-foo_foo',
            'x-foo_foo-host',
        ]);
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

        it('gathers metrics around use of the deprecated dynamic components', () => {
            const incrementCounter = jest.fn();
            const template = `
                <template>
                    <x-dynamic lwc:dynamic={ctor}></x-dynamic>
                    <x-dynamic-two lwc:dynamic={ctor2}></x-dynamic-two>
                </template>
            `;
            transformSync(template, 'foo.html', {
                instrumentation: {
                    log: noop,
                    incrementCounter,
                },
                experimentalDynamicDirective: true,
                ...TRANSFORMATION_OPTIONS,
            });

            const calls = incrementCounter.mock.calls;
            expect(calls).toHaveLength(2);
            expect(calls[0][0]).toBe('lwc-dynamic-directive');
            expect(calls[1][0]).toBe('lwc-dynamic-directive');
        });
    });
});
