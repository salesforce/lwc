import { code } from '../utils/code';
import { toIdentifier } from '../utils/identifiers';

import { ASTChildNode } from '../types';

export class Block {
    name: string;
    isRoot: boolean;

    nodeIdentifiers = new Map<ASTChildNode | string, string>();

    identifiers = new Map<string, string | undefined>();
    createStatements: string[] = [];
    insertStatements: string[] = [];
    updateStatements: string[] = [];
    detachStatements: string[] = [];

    constructor(name: string, options: { isRoot: boolean }) {
        this.name = name;
        this.isRoot = options.isRoot;
    }

    registerIdentifier(name: string, init?: string): string {
        name = toIdentifier(name);

        const original = name;
        let suffix = 0;

        while (this.identifiers.has(name)) {
            name = `${original}${suffix++}`;
        }

        this.identifiers.set(name, init);
        return name;
    }

    getNodeIdentifier(node: ASTChildNode, init?: string): string {
        const existingIdentifier = this.nodeIdentifiers.get(node);

        if (existingIdentifier !== undefined) {
            // Hack: Fix this.
            this.identifiers.set(existingIdentifier, init);

            return existingIdentifier;
        }

        let name: string;
        switch (node.type) {
            case 'text':
            case 'comment':
            case 'if-block':
            case 'for-block':
                name = node.type;
                break;

            case 'component':
            case 'element':
                name = node.name;
                break;
        }

        const identifier = this.registerIdentifier(name, init);
        this.nodeIdentifiers.set(node, identifier);

        return identifier;
    }

    render(): string {
        const identifierDeclarations = Array.from(
            this.identifiers.entries()
        ).map(([identifier, init]) =>
            init ? `let ${identifier} = ${init};` : `let ${identifier};`
        );

        const exportToken = this.isRoot ? 'export default ' : '';

        let body = code`
            return {
                create() {
                    ${this.createStatements}
                },
                insert(target, anchor) {
                    ${this.insertStatements}
                },
                update() {
                    ${this.updateStatements}
                },
                detach() {
                    ${this.detachStatements}
                }
            }
        `;

        const usedRendererMethods: Set<string> = new Set();
        body = body.replace(/@(\w+)\(/g, (_, helper) => {
            usedRendererMethods.add(helper);
            return `${helper}(`;
        });

        const rendererMethods = usedRendererMethods.size
            ? `const { ${Array.from(usedRendererMethods).join(', ')} } = renderer;`
            : '';

        return code`
            ${exportToken}function ${this.name}(context, renderer) {
                ${rendererMethods}
                ${identifierDeclarations}
                ${body}
            }
        `;
    }
}
