import { ParentNode } from '../shared-next/types';

export default class Scope {
    parent: Scope | undefined;
    current: ParentNode | undefined;
    private declarations: Map<string, ParentNode>;

    constructor(parent?: Scope) {
        this.parent = parent;
        this.declarations = new Map();
    }

    addDeclaration(node: ParentNode) {
        this.declarations.set(node.type, node);
    }

    has(type: string) {
        return this.declarations.has(type);
    }
}
