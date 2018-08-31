import parser from 'postcss-selector-parser';
import { Root, Tag } from "postcss-selector-parser";

export default function transformSelector(
    root: Root,
    namespaceMapping: { [name: string]: string },
) {
    root.walkTags((tagSelector: Tag) => {
        const { value } = tagSelector;

        for (const [original, target] of Object.entries(namespaceMapping)) {
            if (value.startsWith(`${original}-`)) {
                const namespacedTag = value.replace(`${original}-`, `${target}-`);

                tagSelector.replaceWith(
                    parser.tag({ value: namespacedTag })
                );
            }
        }
    });
}
