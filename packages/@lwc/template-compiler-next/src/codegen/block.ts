import { code } from '../utils/code';
import { toIdentifier } from '../utils/identifiers';

export class Block {
    name: string;
    isRoot: boolean;

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

    addElement(identifier: string, parentIdentifier: string, create: string): string {
        identifier = this.registerIdentifier(identifier);

        this.createStatements.push(`${identifier} = ${create};`);
        this.insertStatements.push(`@insert(${identifier}, ${parentIdentifier});`);

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
