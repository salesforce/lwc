import { Root } from "postcss-selector-parser";

export default function(root: Root) {
    root.walkIds(node => {
        throw root.error(
            `Invalid usage of id selector '#${node.value}'. Use a class selector instead.`, {
                index: node.sourceIndex,
                word: node.value,
            }
        );
    });
}
