import { Root } from 'postcss-selector-parser';

const DEPRECATED_SELECTORS = new Set(['/deep/', '::shadow', '>>>']);
const UNSUPPORTED_SELECTORS = new Set(['::slotted', ':root']);

export default function validate(root: Root) {
    root.walk(node => {
        const { value, sourceIndex } = node;

        if (value) {
            if (DEPRECATED_SELECTORS.has(value)) {
                throw root.error(
                    `Invalid usage of deprecated selector "${value}".`,
                    {
                        index: sourceIndex,
                        word: value,
                    },
                );
            }

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
