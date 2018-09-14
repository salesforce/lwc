import { Root } from "postcss-selector-parser";

export default function(root: Root, filename: string | undefined) {
    root.walkIds(node => {
        const message = `Invalid usage of id selector '#${node.value}'. Use a class selector instead.`;

        // Transforms should either be right or wrong. Refactor this to throw after we're done with the static ID breaking change.
        /* tslint:disable-next-line:no-console */
        console.warn(message, filename);
    });
}
