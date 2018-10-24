import { Root } from 'postcss';
// import parseValue from 'postcss-value-parser';

export default function process(root: Root) {
    root.walkDecls(decl => {
        // const valueRoot = parseValue(decl.value);

        // valueRoot.walk((node) => {
        //     if (node.type === 'function' && node.value === 'var') {
        //         node.value = '';
        //         node.before = 'VAR_START__';
        //         node.after = '__VAR_END';

        //         node.nodes.forEach(child => {
        //             if (child.type === 'div' && child.value === ',') {
        //                 child.value = '__VAR_DIVIDER__';
        //             }
        //         });
        //     }
        // });

        // decl.value = valueRoot.toString();
    });
}
