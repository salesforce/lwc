import traverseModule from '@babel/traverse';

// ESM/CommonJS compatibility
const traverse = traverseModule.default || traverseModule;

/**
 * Analyzes an AST to identify identifiers that must be preserved even when their binding would
 * otherwise be renameable. Under the boundary-aliasing regime, exported binding *names* are
 * renamed (the cross-module string contract is kept by aliasing at the import/export boundary),
 * so they are NOT collected here. What stays protected are names bound to a `.html` template by
 * string (component/exported-class members) and structural type members.
 */
export function analyzeFile(ast) {
    const publicIdentifiers = new Set();

    // Local names of classes that are exported or are LightningElement components. Used only to
    // decide whether a class's MEMBER names must be preserved (the class name itself renames).
    const exportedClassLocals = new Set();

    function isExported(path) {
        return (
            path.parent?.type === 'ExportNamedDeclaration' ||
            path.parent?.type === 'ExportDefaultDeclaration'
        );
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

    // First pass: collect the local names of classes that are exported (inline, default, or via a
    // specifier without a `from`). These names key member-preservation in the second pass.
    traverse(ast, {
        ExportNamedDeclaration(path) {
            if (path.node.source) return; // re-export: no local binding
            const decl = path.node.declaration;
            if (decl && (decl.type === 'ClassDeclaration' || decl.type === 'ClassExpression')) {
                if (decl.id?.type === 'Identifier') {
                    exportedClassLocals.add(decl.id.name);
                }
            }
            path.node.specifiers?.forEach((spec) => {
                if (spec.type === 'ExportSpecifier' && spec.local?.type === 'Identifier') {
                    exportedClassLocals.add(spec.local.name);
                }
            });
        },
        ExportDefaultDeclaration(path) {
            const decl = path.node.declaration;
            if (decl?.type === 'ClassDeclaration' && decl.id?.type === 'Identifier') {
                exportedClassLocals.add(decl.id.name);
            }
        },
    });

    traverse(ast, {
        // Member names of exported classes and LightningElement components are bound to `.html`
        // templates by string and read by the engine, so they must be preserved like a public
        // API even though the class name itself is renamed.
        ClassDeclaration(path) {
            const className = path.node.id?.name;
            const isPublicClass = className && exportedClassLocals.has(className);
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

        // Members of an exported interface are part of the structural contract consumed across
        // modules; preserve them (the interface name itself is renamed and aliased).
        TSInterfaceDeclaration(path) {
            if (isExported(path)) {
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

        // Members of an exported enum are referenced by name across modules; preserve them (the
        // enum name itself is renamed and aliased).
        TSEnumDeclaration(path) {
            if (isExported(path)) {
                path.node.members.forEach((member) => {
                    if (member.id.type === 'Identifier') {
                        publicIdentifiers.add(member.id.name);
                    }
                });
            }
        },
    });

    return { publicIdentifiers, exportedClassLocals };
}
