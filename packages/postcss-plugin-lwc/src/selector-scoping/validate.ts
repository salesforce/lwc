import {
    Root,
    isAttribute,
    isCombinator,
    isTag,
    Tag,
} from 'postcss-selector-parser';

import {
    isGlobalAttribute,
    isAriaAttribute,
    isDataAttribute,
    isKnowAttributeOnElement,
} from '../helpers/html-attributes';

import { generateCompilerError, PostCSSErrors } from 'lwc-errors';

const DEPRECATED_SELECTORS = new Set(['/deep/', '::shadow', '>>>']);
const UNSUPPORTED_SELECTORS = new Set(['::slotted', ':root', ':host-context']);

function validateSelectors(root: Root) {
    root.walk(node => {
        const { value, sourceIndex } = node;

        if (value) {
            // Ensure the selector doesn't use a deprecated CSS selector.
            if (DEPRECATED_SELECTORS.has(value)) {
                // TODO ERROR CODES: Normalize compiler errors to a standard pattern
                throw generateCompilerError(PostCSSErrors.SELECTOR_SCOPE_DEPRECATED_SELECTOR, {
                    messageArgs: [value],

                    errorConstructor: (message: string) => {
                        return root.error(message, { index: sourceIndex, word: value });
                    }
                });
            }

            // Ensure the selector doesn't use an unsupported selector.
            if (UNSUPPORTED_SELECTORS.has(value)) {
                throw generateCompilerError(PostCSSErrors.SELECTOR_SCOPE_UNSUPPORTED_SELECTOR, {
                    messageArgs: [value],

                    errorConstructor: (message: string) => {
                        return root.error(message, { index: sourceIndex, word: value });
                    }
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
            if (isGlobalAttribute(attributeName) || isAriaAttribute(attributeName) || isDataAttribute(attributeName)) {
                return;
            }

            // If the attribute name is not a globally available attribute, the attribute selector is required
            // to be associated with a tag selector, so we can validate its usage. Let's walk the compound selector
            // backward to find the associated tag selector.
            let tagSelector: Tag | undefined = undefined;
            let runner = node.prev();

            while (
                tagSelector === undefined &&
                runner !== undefined &&
                !isCombinator(runner)
            ) {
                if (isTag(runner)) {
                    tagSelector = runner;
                } else {
                    runner = runner.prev();
                }
            }

            // If the tag selector is not present in the compound selector, we need to warn the user that
            // the compound selector need to be more specific.
            if (tagSelector === undefined) {
                throw generateCompilerError(PostCSSErrors.SELECTOR_SCOPE_ATTR_SELECTOR_MISSING_TAG_SELECTOR, {
                    messageArgs: [attributeName],

                    errorConstructor: (message: string) => {
                        return root.error(message, { index: sourceIndex, word: attributeName });
                    }
                });
            }

            // If compound selector is associated with a tag selector, we can validate the usage of the
            // attribute against the specific tag.
            const { value: tagName } = tagSelector;
            if (!isKnowAttributeOnElement(tagName, attributeName)) {
                throw generateCompilerError(PostCSSErrors.SELECTOR_SCOPE_ATTR_SELECTOR_NOT_KNOWN_ON_TAG, {
                    messageArgs: [attributeName, tagName],

                    errorConstructor: (message: string) => {
                        return root.error(message, { index: sourceIndex, word: attributeName });
                    }
                });
            }
        }
    });
}

export default function validate(root: Root) {
    validateSelectors(root);
    validateAttribute(root);
}
