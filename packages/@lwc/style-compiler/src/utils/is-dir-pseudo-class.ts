import { isPseudoClass, Node, Pseudo } from 'postcss-selector-parser';

export default function isDir(node: Node): node is Pseudo {
    return isPseudoClass(node) && node.value === ':dir';
}
