import { Root } from "postcss-selector-parser";

export default function(root: Root) {
    root.walkIds(node => {
        const message = `Invalid usage of id selector '#${node.value}'. Try using a class selector or some other selector.`;
        throw root.error(message, {
            index: node.sourceIndex,
            word: node.value,
        });
    });
}
