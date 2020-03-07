import { Block } from './block';

import { code } from '../utils/code';
import { toIdentifier } from '../utils/identifiers';

export class Renderer {
    blocks: Block[] = [];
    imports: Map<string, Map<string, string>> = new Map();

    addImport(module: string, name: string): string {
        let moduleMap = this.imports.get(module);

        if (!moduleMap) {
            moduleMap = new Map();
            this.imports.set(module, moduleMap);
        }

        let importIdentifier = moduleMap.get(name);
        if (!importIdentifier) {
            importIdentifier = toIdentifier(`${module}__${name}`);
            moduleMap.set(name, importIdentifier);
        }

        return importIdentifier;
    }

    createBlock(name: string, options?: { isRoot: boolean }) {
        const original = name;

        let suffix = 0;
        while (this.blocks.some(block => block.name === name)) {
            name = `${original}${suffix++}`;
        }

        const block = new Block(name, {
            isRoot: options?.isRoot ?? false,
        });
        this.blocks.push(block);

        return block;
    }

    render() {
        let result = Array.from(this.blocks.values())
            .map(block => block.render())
            .join('\n\n');

        if (this.imports.size) {
            const imports = Array.from(this.imports.entries()).map(([name, importees]) => {
                let defaultSpecifier;
                const namedSpecifiers = [];

                for (const [imported, local] of importees.entries()) {
                    if (imported === 'default') {
                        defaultSpecifier = local;
                    } else {
                        namedSpecifiers.push(`${imported} as ${local}`);
                    }
                }

                let specifiers = '';
                if (defaultSpecifier) specifiers += defaultSpecifier;
                if (namedSpecifiers.length) {
                    if (specifiers.length) specifiers += ', ';
                    specifiers += `{ ${namedSpecifiers.join(', ')} }`;
                }

                return `import ${specifiers} from '${name}';`;
            });

            result = code`
                ${imports}

                ${result}
            `;
        }

        return result;
    }
}
