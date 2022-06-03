/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { normalizeConfig } from '../config';

describe('customRendererConfig normalization', () => {
    it('should throw if customRendererConfig is set and provideCustomRendererHooks is not set', () => {
        expect(() =>
            normalizeConfig({ customRendererConfig: { elements: [], directives: [] } })
        ).toThrowErrorMatchingInlineSnapshot(
            `"LWC1151: customRendererConfig can be specified only when provideCustomRendererHooks config is set to true"`
        );
    });

    it('should lower case all tag names and attributes', () => {
        expect(
            normalizeConfig({
                provideCustomRendererHooks: true,
                customRendererConfig: {
                    directives: [],
                    elements: [
                        {
                            tagName: 'DIV',
                        },
                        {
                            tagName: 'SPAN',
                            attributes: ['STYLE'],
                        },
                    ],
                },
            })
        ).toMatchInlineSnapshot(`
            Object {
              "customRendererConfig": Object {
                "directives": Array [],
                "elements": Array [
                  Object {
                    "attributes": undefined,
                    "tagName": "div",
                  },
                  Object {
                    "attributes": Array [
                      "style",
                    ],
                    "tagName": "span",
                  },
                ],
              },
              "experimentalComputedMemberExpression": false,
              "experimentalDynamicDirective": false,
              "preserveHtmlComments": false,
              "provideCustomRendererHooks": true,
            }
        `);
    });

    it('should throw on duplicate tag names', () => {
        expect(() =>
            normalizeConfig({
                provideCustomRendererHooks: true,
                customRendererConfig: {
                    directives: [],
                    elements: [
                        {
                            tagName: 'use',
                            attributes: ['href'],
                        },
                        {
                            tagName: 'use',
                            attributes: ['xlink:href'],
                        },
                    ],
                },
            })
        ).toThrowErrorMatchingInlineSnapshot(
            `"LWC1150: customRendererConfig contains duplicate entry for use element tag"`
        );
    });

    it('should throw if custom element tag used', () => {
        expect(() =>
            normalizeConfig({
                provideCustomRendererHooks: true,
                customRendererConfig: {
                    directives: [],
                    elements: [
                        {
                            tagName: 'lightning-input',
                            attributes: ['value'],
                        },
                    ],
                },
            })
        ).toThrowErrorMatchingInlineSnapshot(
            `"LWC1152: customRendererConfig should not contain a custom element tag, but found lightning-input"`
        );
    });
});
