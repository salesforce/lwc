import {
    Root,
    isAttribute,
    isCombinator,
    isTag,
    Tag,
} from 'postcss-selector-parser';

import {
    GLOBAL_ATTRIBUTE_SET,
    isValidAttribute,
} from './html-attributes';

const DEPRECATED_SELECTORS = new Set(['/deep/', '::shadow', '>>>']);
const UNSUPPORTED_SELECTORS = new Set(['::slotted', ':root', ':host-context']);

function validateSelectors(root: Root) {
    root.walk(node => {
        const { value, sourceIndex } = node;

        if (value) {
            // Ensure the selector doesn't use a deprecated CSS selector.
            if (DEPRECATED_SELECTORS.has(value)) {
                throw root.error(
                    `Invalid usage of deprecated selector "${value}".`,
                    {
                        index: sourceIndex,
                        word: value,
                    },
                );
            }

            // Ensure the selector doesn't use an unsupported selector.
            if (UNSUPPORTED_SELECTORS.has(value)) {
                throw root.error(
                    `Invalid usage of unsupported selector "${value}".`,
                    {
                        index: sourceIndex,
                        word: value,
                    },
                );
            }
        }
    });
}

function validateAttribute(root: Root) {
    root.walk(node => {
        if (isAttribute(node)) {
            const { attribute, sourceIndex } = node;

            // Global HTML attributes are valid on all the element, custom or not.
            const isGlobalHTMLAttribute = GLOBAL_ATTRIBUTE_SET.has(attribute);
            if (isGlobalHTMLAttribute) {
                return;
            }

            // If the attribute is not a global one we need to validate it's usage. Walking
            // backward the selector chain to find a tag selector in the compound selector.
            // The lookup stop when either a tag is found or when reaching the next
            // combinator - which indicates the end of the compound selector.
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

            // Error out when not tag selector is present in the compound selector.
            if (!tagSelector) {
                throw root.error(
                    `Selector "${node}" is too generic, add a tag selector.`,
                    {
                        index: sourceIndex,
                        word: attribute,
                    },
                );
            }

            // Check if the attribute is permitted for the considered tag.
            const isValidSelector = isValidAttribute(
                tagSelector.value,
                attribute,
            );
            if (!isValidSelector) {
                const message = [
                    `Attribute selector "${node}" can't be applied to match on <${tagSelector}>. `,
                    `Use another method to match on the element.`,
                ];

                throw root.error(message.join(''), {
                    index: sourceIndex,
                    word: attribute,
                });
            }
        }
    });
}

export default function validate(root: Root) {
    validateSelectors(root);
    validateAttribute(root);
}
