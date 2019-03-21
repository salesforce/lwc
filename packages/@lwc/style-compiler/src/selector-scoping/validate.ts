/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Root, isAttribute, isCombinator, isTag, Tag } from 'postcss-selector-parser';

import {
    isGlobalAttribute,
    isAriaAttribute,
    isDataAttribute,
    isKnowAttributeOnElement,
} from '../utils/html-attributes';

const DEPRECATED_SELECTORS = new Set(['/deep/', '::shadow', '>>>']);
const UNSUPPORTED_SELECTORS = new Set(['::slotted', ':root', ':host-context']);

function validateSelectors(root: Root) {
    root.walk(node => {
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
    root.walk(node => {
        if (isAttribute(node)) {
            const { attribute: attributeName, sourceIndex } = node;

            // Let's check if the attribute name is either a Global HTML attribute, an ARIA attribute
            // or a data-* attribute since those are available on all the elements.
            if (
                isGlobalAttribute(attributeName) ||
                isAriaAttribute(attributeName) ||
                isDataAttribute(attributeName)
            ) {
                return;
            }

            // If the attribute name is not a globally available attribute, the attribute selector is required
            // to be associated with a tag selector, so we can validate its usage. Let's walk the compound selector
            // backward to find the associated tag selector.
            let tagSelector: Tag | undefined;
            let runner = node.prev();

            while (tagSelector === undefined && runner !== undefined && !isCombinator(runner)) {
                if (isTag(runner)) {
                    tagSelector = runner;
                } else {
                    runner = runner.prev();
                }
            }

            // If the tag selector is not present in the compound selector, we need to warn the user that
            // the compound selector need to be more specific.
            if (tagSelector === undefined) {
                const message = [
                    `Invalid usage of attribute selector "${attributeName}". `,
                    `For validation purposes, attributes that are not global attributes must be associated `,
                    `with a tag name when used in a CSS selector. (e.g., "input[min]" instead of "[min]")`,
                ];

                throw root.error(message.join(''), {
                    index: sourceIndex,
                    word: attributeName,
                });
            }

            // If compound selector is associated with a tag selector, we can validate the usage of the
            // attribute against the specific tag.
            const { value: tagName } = tagSelector;
            if (!isKnowAttributeOnElement(tagName, attributeName)) {
                const message = [
                    `Invalid usage of attribute selector "${attributeName}". `,
                    `Attribute "${attributeName}" is not a known attribute on <${tagName}> element.`,
                ];

                throw root.error(message.join(''), {
                    index: sourceIndex,
                    word: attributeName,
                });
            }
        }
    });
}

export default function validate(root: Root) {
    validateSelectors(root);
    validateAttribute(root);
}
