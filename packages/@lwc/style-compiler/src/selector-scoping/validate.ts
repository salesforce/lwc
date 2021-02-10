/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root } from 'postcss-selector-parser';

const DEPRECATED_SELECTORS = new Set(['/deep/', '::shadow', '>>>']);
const UNSUPPORTED_SELECTORS = new Set([':root', ':host-context']);
const TEMPLATE_DIRECTIVES = [/^key$/, /^lwc:*/, /^if:*/, /^for:*/, /^iterator:*/];

function validateSelectors(root: Root) {
    root.walk((node) => {
        const { value, sourceIndex } = node;

        if (value) {
            // Ensure the selector doesn't use a deprecated CSS selector.
            if (DEPRECATED_SELECTORS.has(value)) {
                throw root.error(`Invalid usage of deprecated selector "${value}".`, {
                    index: sourceIndex,
                    word: value,
                });
            }

            // Ensure the selector doesn't use an unsupported selector.
            if (UNSUPPORTED_SELECTORS.has(value)) {
                throw root.error(`Invalid usage of unsupported selector "${value}".`, {
                    index: sourceIndex,
                    word: value,
                });
            }
        }
    });
}

function validateAttribute(root: Root) {
    root.walkAttributes((node) => {
        const { attribute: attributeName, sourceIndex } = node;
        const isTemplateDirective = TEMPLATE_DIRECTIVES.some((directive) => {
            return directive.test(attributeName);
        });

        if (isTemplateDirective) {
            const message = [
                `Invalid usage of attribute selector "${attributeName}". `,
                `"${attributeName}" is a template directive and therefore not supported in css rules.`,
            ];

            throw root.error(message.join(''), {
                index: sourceIndex,
                word: attributeName,
            });
        }
    });
}

export default function validate(root: Root) {
    validateSelectors(root);
    validateAttribute(root);
}
