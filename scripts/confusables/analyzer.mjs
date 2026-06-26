import traverseModule from '@babel/traverse';

// ESM/CommonJS compatibility
const traverse = traverseModule.default || traverseModule;

/**
 * Analyzes an AST to identify which identifiers are public (exported)
 * and which are private (internal only).
 */
export function analyzeFile(ast) {
    const publicIdentifiers = new Set();

    // Helper to check if a path is exported
    function isExported(path) {
        return (
            path.parent?.type === 'ExportNamedDeclaration' ||
            path.parent?.type === 'ExportDefaultDeclaration'
        );
    }

    // Helper to extract identifier names from a node
    function extractIdentifier(node) {
        if (node.type === 'Identifier') {
            return node.name;
        }
        return null;
    }

    // Collects the local binding names introduced by a (possibly nested) binding pattern. For an
    // exported destructuring (`export const { ELEMENT_NODE } = _Node`), these locals ARE the
    // export names and must be preserved.
    function collectPatternBindings(node, out) {
        if (!node) return;
        switch (node.type) {
            case 'Identifier':
                out.add(node.name);
                break;
            case 'ObjectPattern':
                node.properties.forEach((prop) => {
                    if (prop.type === 'RestElement') {
                        collectPatternBindings(prop.argument, out);
                    } else {
                        // The value is the local binding; the key is the source property.
                        collectPatternBindings(prop.value, out);
                    }
                });
                break;
            case 'ArrayPattern':
                node.elements.forEach((el) => collectPatternBindings(el, out));
                break;
            case 'AssignmentPattern':
                collectPatternBindings(node.left, out);
                break;
            case 'RestElement':
                collectPatternBindings(node.argument, out);
                break;
            default:
                break;
        }
    }

    // Detects `class X extends LightningElement` and `extends NamespacedAlias.LightningElement`.
    function extendsLightningElement(superClass) {
        if (!superClass) return false;
        if (superClass.type === 'Identifier') {
            return superClass.name === 'LightningElement';
        }
        if (superClass.type === 'MemberExpression' && superClass.property?.type === 'Identifier') {
            return superClass.property.name === 'LightningElement';
        }
        return false;
    }

    traverse(ast, {
        // Track all export declarations
        ExportNamedDeclaration(path) {
            // export function foo() {}
            // export class Bar {}
            // export const baz = ...
            if (path.node.declaration) {
                // Only try to extract id if it exists (not all declarations have an id)
                if (path.node.declaration.id) {
                    const id = extractIdentifier(path.node.declaration.id);
                    if (id) {
                        publicIdentifiers.add(id);
                    }
                }

                // export const a = ..., export const { a, b } = ..., export const [a] = ...
                if (path.node.declaration.type === 'VariableDeclaration') {
                    path.node.declaration.declarations.forEach((decl) => {
                        collectPatternBindings(decl.id, publicIdentifiers);
                    });
                }
            }

            // export { foo, bar }
            // export { foo as bar }
            path.node.specifiers?.forEach((spec) => {
                if (spec.exported) {
                    publicIdentifiers.add(spec.exported.name);
                }
                // Also mark the local binding as public
                if (spec.local) {
                    publicIdentifiers.add(spec.local.name);
                }
            });
        },

        ExportDefaultDeclaration(path) {
            // export default class Foo
            // export default function bar
            if (path.node.declaration.id) {
                const id = extractIdentifier(path.node.declaration.id);
                if (id) {
                    publicIdentifiers.add(id);
                }
            }
        },

        // Mark class members of exported classes and LightningElement components as public.
        // Component member names are bound to `.html` templates by string and read by the
        // engine, so they must be preserved like a public API.
        ClassDeclaration(path) {
            const className = path.node.id?.name;
            const isPublicClass = className && publicIdentifiers.has(className);
            const isComponent = extendsLightningElement(path.node.superClass);
            if (isPublicClass || isComponent) {
                path.node.body.body.forEach((member) => {
                    if (
                        member.type === 'ClassMethod' ||
                        member.type === 'ClassProperty' ||
                        member.type === 'PropertyDefinition'
                    ) {
                        if (member.key.type === 'Identifier' && !member.computed) {
                            publicIdentifiers.add(member.key.name);
                        }
                    }
                });
            }
        },

        // Track interface/type exports
        TSInterfaceDeclaration(path) {
            if (isExported(path)) {
                publicIdentifiers.add(path.node.id.name);

                // Mark all interface members as public
                path.node.body.body.forEach((member) => {
                    if (member.type === 'TSPropertySignature' && member.key.type === 'Identifier') {
                        publicIdentifiers.add(member.key.name);
                    }
                    if (member.type === 'TSMethodSignature' && member.key.type === 'Identifier') {
                        publicIdentifiers.add(member.key.name);
                    }
                });
            }
        },

        TSTypeAliasDeclaration(path) {
            if (isExported(path)) {
                publicIdentifiers.add(path.node.id.name);
            }
        },

        TSEnumDeclaration(path) {
            if (isExported(path)) {
                publicIdentifiers.add(path.node.id.name);
                // Mark all enum members as public
                path.node.members.forEach((member) => {
                    if (member.id.type === 'Identifier') {
                        publicIdentifiers.add(member.id.name);
                    }
                });
            }
        },
    });

    return { publicIdentifiers };
}
