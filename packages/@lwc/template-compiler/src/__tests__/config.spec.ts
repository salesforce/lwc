/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { normalizeConfig } from '../config';

describe('sanitizeConfig normalization', () => {
    it('should throw if sanitizeConfig is set and provideSanitizationHooks is not set', () => {
        expect(() =>
            normalizeConfig({ sanitizeConfig: { elements: [], directives: [] } })
        ).toThrowErrorMatchingInlineSnapshot(
            `"LWC1151: sanitizeConfig can be specified only when addSanitizationHooks config is set to true"`
        );
    });

    it('should lower case all tag names and attributes', () => {
        expect(
            normalizeConfig({
                provideSanitizationHooks: true,
                sanitizeConfig: {
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
              "experimentalComputedMemberExpression": false,
              "experimentalDynamicDirective": false,
              "preserveHtmlComments": false,
              "provideSanitizationHooks": true,
              "sanitizeConfig": Object {
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
            }
        `);
    });

    it('should throw on duplicate tag names', () => {
        expect(() =>
            normalizeConfig({
                provideSanitizationHooks: true,
                sanitizeConfig: {
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
            `"LWC1150: Sanitize config contains duplicate entry for use element tag"`
        );
    });
});
