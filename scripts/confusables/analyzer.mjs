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

    traverse(ast, {
        // Track all export declarations
        ExportNamedDeclaration(path) {
            // export function foo() {}
            // export class Bar {}
            // export const baz = ...
            if (path.node.declaration) {
                const id = extractIdentifier(path.node.declaration.id);
                if (id) {
                    publicIdentifiers.add(id);
                }

                // export const { a, b } = ...
                if (path.node.declaration.type === 'VariableDeclaration') {
                    path.node.declaration.declarations.forEach((decl) => {
                        if (decl.id.type === 'Identifier') {
                            publicIdentifiers.add(decl.id.name);
                        }
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
            const id = extractIdentifier(path.node.declaration.id);
            if (id) {
                publicIdentifiers.add(id);
            }
        },

        // Mark class members of exported classes as public
        ClassDeclaration(path) {
            const className = path.node.id?.name;
            if (className && publicIdentifiers.has(className)) {
                // All public methods/properties of public class
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
