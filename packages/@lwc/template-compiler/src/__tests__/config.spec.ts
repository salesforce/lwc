/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { normalizeConfig } from '../config';

describe('customRendererConfig normalization', () => {
    it('should lower case all tag names and attributes', () => {
        expect(
            normalizeConfig({
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
            {
              "apiVersion": 58,
              "customRendererConfig": {
                "directives": [],
                "elements": [
                  {
                    "attributes": undefined,
                    "namespace": undefined,
                    "tagName": "div",
                  },
                  {
                    "attributes": [
                      "style",
                    ],
                    "namespace": undefined,
                    "tagName": "span",
                  },
                ],
              },
              "enableLwcSpread": false,
              "enableScopedSlots": false,
              "enableStaticContentOptimization": true,
              "experimentalComputedMemberExpression": false,
              "experimentalDynamicDirective": false,
              "preserveHtmlComments": false,
            }
        `);
    });

    it('should throw on duplicate tag names', () => {
        expect(() =>
            normalizeConfig({
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
            `"LWC1151: customRendererConfig should not contain a custom element tag, but found lightning-input"`
        );
    });
});
