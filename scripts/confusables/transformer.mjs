import traverseModule from '@babel/traverse';
import { CONFUSABLES } from './confusables-map.mjs';
import { simpleHash } from './hash.mjs';
import { GLOBAL_IDENTIFIERS } from './globals.mjs';

// ESM/CommonJS compatibility
const traverse = traverseModule.default || traverseModule;

// Declaration node types that live in TypeScript type space and are handled by the dedicated
// type-space machinery (or preserved), never by the value-binding path.
const TYPE_SPACE_DECLARATIONS = new Set([
    'TSTypeAliasDeclaration',
    'TSInterfaceDeclaration',
    // Enums are a dual value+type binding; renaming them safely would require rewriting both
    // their value and type references in lockstep, so they are preserved entirely.
    'TSEnumDeclaration',
    'TSModuleDeclaration',
    'TSImportEqualsDeclaration',
    // Constructor parameter properties (`constructor(private foo)`) create class members
    // accessed via `this.foo`, which scope analysis cannot rename consistently.
    'TSParameterProperty',
]);

/**
 * Selects a confusable character deterministically based on the full identifier.
 */
function selectConfusable(char, fullIdentifier, position) {
    const options = CONFUSABLES[char];
    if (!options || options.length === 0) {
        return char;
    }

    // Hash combines identifier name + character index so a given name always maps to the
    // same confusable everywhere it appears (pure function of the name).
    const hashInput = `${fullIdentifier}:${position}`;
    const hash = simpleHash(hashInput);
    const index = Math.abs(hash) % options.length;

    return options[index];
}

/**
 * Transforms an identifier by replacing ASCII characters with confusables. Pure function of the
 * name, so a name maps to one target everywhere and re-runs are idempotent.
 */
function transformIdentifier(identifier) {
    let result = '';
    for (let i = 0; i < identifier.length; i++) {
        const char = identifier[i];
        result += selectConfusable(char, identifier, i);
    }
    return result;
}

/**
 * Returns the leftmost Identifier of a TS entity name (`X` or `X.Y.Z`), or null.
 */
function leftmostEntityIdentifier(node) {
    let current = node;
    while (current && current.type === 'TSQualifiedName') {
        current = current.left;
    }
    return current && current.type === 'Identifier' ? current : null;
}

/**
 * Returns the leftmost Identifier of a value expression entity (`X` or `X.Y` member), or null.
 * Used for heritage clauses whose `expression` may be a member expression.
 */
function leftmostExprIdentifier(node) {
    let current = node;
    while (
        current &&
        (current.type === 'MemberExpression' || current.type === 'OptionalMemberExpression')
    ) {
        current = current.object;
    }
    return current && current.type === 'Identifier' ? current : null;
}

/**
 * Collects the local binding names introduced by a (possibly nested) binding pattern.
 */
function collectPatternBindings(node, out) {
    if (!node) return;
    switch (node.type) {
        case 'Identifier':
            out.push(node.name);
            break;
        case 'ObjectPattern':
            node.properties.forEach((prop) => {
                if (prop.type === 'RestElement') {
                    collectPatternBindings(prop.argument, out);
                } else {
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

/**
 * Determines whether an identifier path sits in a position where the textual name must be
 * preserved (property keys, member access, import/export specifiers). Import/export specifiers
 * are preserved here so the dedicated import/export visitors can rewrite them with aliasing.
 */
function isPreservedPosition(path) {
    const { parent, node } = path;
    const type = parent?.type;

    // obj.foo / obj?.foo — `foo` is a property name, not a reference to a binding.
    if (
        (type === 'MemberExpression' || type === 'OptionalMemberExpression') &&
        parent.property === node &&
        !parent.computed
    ) {
        return true;
    }

    // Non-shorthand object literal/pattern property key: { foo: ... }
    if (type === 'ObjectProperty' && parent.key === node && !parent.computed && !parent.shorthand) {
        return true;
    }

    // Method / class member keys.
    if (
        (type === 'ObjectMethod' ||
            type === 'ClassMethod' ||
            type === 'ClassPrivateMethod' ||
            type === 'ClassProperty' ||
            type === 'ClassPrivateProperty' ||
            type === 'ClassAccessorProperty') &&
        parent.key === node &&
        !parent.computed
    ) {
        return true;
    }

    // Import/export specifier names are handled by the dedicated import/export visitors.
    if (
        type === 'ImportSpecifier' ||
        type === 'ImportDefaultSpecifier' ||
        type === 'ImportNamespaceSpecifier' ||
        type === 'ExportSpecifier'
    ) {
        return true;
    }

    // JSX names (defensive; LWC source has no JSX).
    if (
        (type === 'JSXAttribute' || type === 'JSXOpeningElement' || type === 'JSXClosingElement') &&
        parent.name === node
    ) {
        return true;
    }

    return false;
}

/**
 * Determines whether an identifier path is inside a TypeScript type position.
 */
function isInTypeContext(path) {
    let current = path;
    while (current) {
        const t = current.parent?.type;
        if (t && t.startsWith('TS') && t.endsWith('Type')) {
            return true;
        }
        if (
            t === 'TSTypeReference' ||
            t === 'TSQualifiedName' ||
            t === 'TSTypeAnnotation' ||
            t === 'TSTypeParameter' ||
            t === 'TSTypeParameterDeclaration' ||
            t === 'TSTypeParameterInstantiation' ||
            t === 'TSInterfaceBody' ||
            t === 'TSPropertySignature' ||
            t === 'TSMethodSignature' ||
            t === 'TSIndexSignature' ||
            t === 'TSTypeQuery' ||
            t === 'TSTypePredicate' ||
            t === 'TSExpressionWithTypeArguments' ||
            t === 'TSInterfaceHeritage'
        ) {
            return true;
        }
        current = current.parentPath;
    }
    return false;
}

/**
 * Returns the type-parameter name as a string, tolerating both the `name: string` and
 * `name: Identifier` shapes Babel has used across versions.
 */
function typeParamName(param) {
    if (!param) return null;
    if (typeof param.name === 'string') return param.name;
    if (param.name?.type === 'Identifier') return param.name.name;
    return null;
}

/**
 * Determines whether a type-position identifier is the leftmost name of a construct the type
 * visitors rewrite (a `TSTypeReference`, `typeof` query, or heritage clause). Such occurrences
 * are "covered"; type occurrences that are NOT covered would desync from a renamed declaration
 * and so make the target unsafe to rename at all.
 */
function isCoveredTypeName(path) {
    if (path.parent?.type === 'TSQualifiedName' && path.parent.right === path.node) {
        return false; // member of a qualified name (`A.B` -> B); never renamed
    }
    let current = path;
    while (
        current.parentPath &&
        current.parent?.type === 'TSQualifiedName' &&
        current.parent.left === current.node
    ) {
        current = current.parentPath;
    }
    const owner = current.parent?.type;
    return (
        owner === 'TSTypeReference' ||
        owner === 'TSExpressionWithTypeArguments' ||
        owner === 'TSTypeQuery'
    );
}

/**
 * Whether an identifier is the `id` of a renameable type-space declaration (handled by the
 * dedicated type-decl visitor, not the generic value visitor).
 */
function isTypeDeclId(parent, node) {
    return (
        (parent?.type === 'TSTypeAliasDeclaration' || parent?.type === 'TSInterfaceDeclaration') &&
        parent.id === node
    );
}

/**
 * Transforms identifiers in the source code. Module-scope imports and exports are renamed with
 * the cross-module string contract preserved via aliasing at the boundary; references (value and
 * type) are rewritten to the renamed local.
 */
export function transformSource(ast, source, analysis) {
    const { publicIdentifiers } = analysis;
    const replacements = [];

    // --- Pass A: classify value bindings ---------------------------------------------------
    const renameableIds = new Set();

    function isTypeOnlyImportSpecifier(binding) {
        const node = binding.path?.node;
        if (!node) return false;
        if (node.type === 'ImportSpecifier' && node.importKind === 'type') return true;
        const decl = binding.path?.parent;
        return (
            (node.type === 'ImportSpecifier' ||
                node.type === 'ImportDefaultSpecifier' ||
                node.type === 'ImportNamespaceSpecifier') &&
            decl?.type === 'ImportDeclaration' &&
            decl.importKind === 'type'
        );
    }

    function isRenameable(binding, name) {
        if (!binding || !binding.identifier) return false;
        if (GLOBAL_IDENTIFIERS.has(name)) return false;
        if (publicIdentifiers.has(name)) return false;
        if (TYPE_SPACE_DECLARATIONS.has(binding.path?.node?.type)) return false;
        // Type-only imports have no value references; they are handled via the type-name path.
        if (isTypeOnlyImportSpecifier(binding)) return false;
        return true;
    }

    const scopes = new Set();
    traverse(ast, {
        enter(path) {
            scopes.add(path.scope);
        },
    });
    for (const scope of scopes) {
        for (const name of Object.keys(scope.bindings)) {
            const binding = scope.bindings[name];
            if (isRenameable(binding, name)) {
                renameableIds.add(binding.identifier);
            }
        }
    }

    // --- Pass A2: classify type-space names -------------------------------------------------
    // Type aliases, interfaces, and type-only import locals. Enums are excluded (dual binding).
    const renameableTypeNames = new Set();

    function considerTypeName(name) {
        if (!name) return;
        if (GLOBAL_IDENTIFIERS.has(name)) return;
        if (publicIdentifiers.has(name)) return;
        renameableTypeNames.add(name);
    }

    traverse(ast, {
        TSTypeAliasDeclaration(path) {
            considerTypeName(path.node.id?.name);
        },
        TSInterfaceDeclaration(path) {
            considerTypeName(path.node.id?.name);
        },
        ImportDeclaration(path) {
            const declTypeOnly = path.node.importKind === 'type';
            for (const spec of path.node.specifiers) {
                const specTypeOnly =
                    declTypeOnly || (spec.type === 'ImportSpecifier' && spec.importKind === 'type');
                if (specTypeOnly && spec.local?.type === 'Identifier') {
                    considerTypeName(spec.local.name);
                }
            }
        },
    });

    // --- Pass A2c: collect type-parameter names ---------------------------------------------
    // Generic type parameters (`<T>`), mapped-type keys (`[K in ...]`), and `infer` vars are all
    // TSTypeParameter nodes. The deterministic mapping means a name maps to one confusable
    // everywhere, so a file-global name set suffices to rename declarations and references in
    // lockstep; precise scope resolution is unnecessary.
    const typeParamNames = new Set();
    // Names whose declaration carries a modifier (`in`/`out` variance or `const`). A modifier
    // shifts node.start off the name onto the keyword, so the name slice would corrupt it. Since
    // the rename set is name-keyed and file-global, a single modifier-bearing occurrence forces
    // the whole name ASCII (declaration AND references) to keep them in lockstep.
    const blockedTypeParamNames = new Set();

    traverse(ast, {
        TSTypeParameter(path) {
            const node = path.node;
            const name = typeParamName(node);
            if (!name) return;
            if (node.in || node.out || node.const) {
                blockedTypeParamNames.add(name);
                return;
            }
            if (GLOBAL_IDENTIFIERS.has(name)) return;
            if (publicIdentifiers.has(name)) return;
            typeParamNames.add(name);
        },
    });
    for (const n of blockedTypeParamNames) typeParamNames.delete(n);

    function resolvesToRenameableValue(path, name) {
        const binding = path.scope.getBinding(name);
        return binding && renameableIds.has(binding.identifier) ? binding : null;
    }

    // --- Pass A2b: value-exported inline names ----------------------------------------------
    // Names exported via an inline value declaration (`export const/function/class`). A plain
    // export specifier for such a name carries BOTH its value and type meaning, so a separate
    // `type`-flavored re-export of a same-named declaration merge would duplicate the identifier.
    const valueExportedNames = new Set();
    traverse(ast, {
        ExportNamedDeclaration(path) {
            if (path.node.source) return;
            const decl = path.node.declaration;
            if (!decl) return;
            if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') {
                if (decl.id?.type === 'Identifier') valueExportedNames.add(decl.id.name);
            } else if (decl.type === 'VariableDeclaration') {
                for (const d of decl.declarations) {
                    const names = [];
                    collectPatternBindings(d.id, names);
                    names.forEach((n) => valueExportedNames.add(n));
                }
            }
        },
    });

    // --- Pass A3: coverage prescan ----------------------------------------------------------
    // Any type-position reference to a renameable target that is NOT in a covered position would
    // desync from the renamed declaration, so mark that target unsafe and leave it ASCII.
    const unsafeValueIds = new Set();
    const unsafeTypeNames = new Set();
    const unsafeTypeParamNames = new Set();

    traverse(ast, {
        Identifier(path) {
            const { node, parent } = path;
            const name = node.name;
            if (!isInTypeContext(path)) return;
            if (isCoveredTypeName(path)) return;
            if (GLOBAL_IDENTIFIERS.has(name)) return;
            if (parent?.type === 'TSQualifiedName' && parent.right === node) return;
            if (parent?.type === 'TSTypeParameter') return;
            if (isTypeDeclId(parent, node)) return;
            if (
                parent?.type === 'ImportSpecifier' ||
                parent?.type === 'ImportDefaultSpecifier' ||
                parent?.type === 'ImportNamespaceSpecifier' ||
                parent?.type === 'ExportSpecifier'
            ) {
                return;
            }
            // Computed type-member keys are covered by their dedicated visitor.
            if (
                (parent?.type === 'TSPropertySignature' || parent?.type === 'TSMethodSignature') &&
                parent.key === node
            ) {
                return;
            }
            // Type predicates / assertion signatures are covered by their dedicated visitor.
            if (parent?.type === 'TSTypePredicate' && parent.parameterName === node) {
                return;
            }

            const binding = path.scope.getBinding(name);
            if (binding && renameableIds.has(binding.identifier)) {
                // Value-unsafe early return is sufficient: this occurrence resolves to the value
                // binding (now forced ASCII), and value vs. type-param are independent namespaces,
                // so falling through to the type-param check below would be wrong, not merely
                // redundant — the uncovered occurrence belongs to the value, not the type param.
                unsafeValueIds.add(binding.identifier);
                return;
            }
            if (renameableTypeNames.has(name)) {
                unsafeTypeNames.add(name);
            }
            if (typeParamNames.has(name)) {
                unsafeTypeParamNames.add(name);
            }
        },
    });

    for (const id of unsafeValueIds) renameableIds.delete(id);
    for (const n of unsafeTypeNames) renameableTypeNames.delete(n);
    for (const n of unsafeTypeParamNames) typeParamNames.delete(n);

    function resolvesToRenameableType(path, name) {
        if (GLOBAL_IDENTIFIERS.has(name)) return false;
        if (resolvesToRenameableValue(path, name)) return true;
        if (renameableTypeNames.has(name)) return true;
        return typeParamNames.has(name);
    }

    function pushRename(idNode) {
        const target = transformIdentifier(idNode.name);
        if (target === idNode.name) return;
        replacements.push({
            start: idNode.start,
            end: idNode.start + idNode.name.length,
            text: target,
        });
    }

    // Renames a type-parameter declaration. The name is a plain string on the node, so the slice
    // is `[start, start + name.length)`; the `extends`/`default` clause that follows (covered by
    // node.end) is left untouched.
    function pushRenameTypeParam(tpNode) {
        const name = typeParamName(tpNode);
        if (!name) return;
        if (!typeParamNames.has(name)) return; // dropped by the coverage prescan, or guarded out
        const target = transformIdentifier(name);
        if (target === name) return;
        replacements.push({
            start: tpNode.start,
            end: tpNode.start + name.length,
            text: target,
        });
    }

    // --- Pass B: emit replacements ----------------------------------------------------------
    traverse(ast, {
        // Rewrite import specifiers, preserving the external string contract via aliasing.
        ImportDeclaration(path) {
            const declTypeOnly = path.node.importKind === 'type';
            for (const spec of path.node.specifiers) {
                const local = spec.local;
                if (!local || local.type !== 'Identifier') continue;
                const name = local.name;
                if (GLOBAL_IDENTIFIERS.has(name) || publicIdentifiers.has(name)) continue;

                const specTypeOnly =
                    declTypeOnly || (spec.type === 'ImportSpecifier' && spec.importKind === 'type');

                let renameable;
                if (specTypeOnly) {
                    renameable = renameableTypeNames.has(name);
                } else {
                    const binding = path.scope.getBinding(name);
                    renameable = !!(binding && renameableIds.has(binding.identifier));
                }
                if (!renameable) continue;

                const target = transformIdentifier(name);
                if (target === name) continue;

                if (spec.type === 'ImportSpecifier') {
                    const imported = spec.imported;
                    const aliased = imported.start !== local.start;
                    if (aliased) {
                        // `import { foo as bar }` -> rename only the local `bar`.
                        replacements.push({
                            start: local.start,
                            end: local.start + name.length,
                            text: target,
                        });
                    } else {
                        // `import { foo }` -> `import { foo as <target> }`.
                        replacements.push({
                            start: imported.end,
                            end: imported.end,
                            text: ` as ${target}`,
                        });
                    }
                } else {
                    // Default/namespace import: external contract is `default` / none, so the
                    // local name is free — pure rename, no alias.
                    replacements.push({
                        start: local.start,
                        end: local.start + name.length,
                        text: target,
                    });
                }
            }
        },

        // Rewrite exports: rename the local binding and preserve the export name via aliasing.
        ExportNamedDeclaration(path) {
            const node = path.node;
            if (node.source) return; // re-export: no local binding

            if (node.declaration) {
                emitInlineExportRestructure(path);
                return;
            }

            for (const spec of node.specifiers || []) {
                if (spec.type !== 'ExportSpecifier') continue;
                const local = spec.local;
                const exported = spec.exported;
                if (local.type !== 'Identifier') continue;
                const name = local.name;
                if (GLOBAL_IDENTIFIERS.has(name) || publicIdentifiers.has(name)) continue;

                let renameable = false;
                const binding = path.scope.getBinding(name);
                if (binding && renameableIds.has(binding.identifier)) renameable = true;
                else if (renameableTypeNames.has(name)) renameable = true;
                if (!renameable) continue;

                const target = transformIdentifier(name);
                if (target === name) continue;

                const aliased = exported.start !== local.start;
                if (aliased) {
                    // `export { local as Pub }` -> `export { <target> as Pub }`.
                    replacements.push({
                        start: local.start,
                        end: local.start + name.length,
                        text: target,
                    });
                } else {
                    // `export { local }` -> `export { <target> as local }`.
                    replacements.push({
                        start: local.start,
                        end: local.start,
                        text: `${target} as `,
                    });
                }
            }
        },

        // Expand shorthand object properties so the key stays ASCII while the value is renamed.
        ObjectProperty(path) {
            if (!path.node.shorthand) return;

            const valueNode = path.node.value;
            let idNode = null;
            if (valueNode.type === 'Identifier') {
                idNode = valueNode;
            } else if (
                valueNode.type === 'AssignmentPattern' &&
                valueNode.left.type === 'Identifier'
            ) {
                idNode = valueNode.left;
            }
            if (!idNode) return;

            // The reference path renames via `resolvesToRenameableValue` (a scope `getBinding`
            // lookup). For a catch-clause shorthand binding (`catch ({ message })`) Babel registers
            // the binding in `scope.bindings` — so it is in `renameableIds` — but `getBinding`
            // returns null from the declaration path itself, so the lookup alone would skip the
            // declaration and desync from the renamed reference. Fall back to direct membership.
            // This relies on `idNode` being the very node Babel stored as `binding.identifier` (a
            // shorthand property's value Identifier is that node), so the `renameableIds` Set —
            // keyed by node identity — matches it.
            if (!resolvesToRenameableValue(path, idNode.name) && !renameableIds.has(idNode)) return;

            const target = transformIdentifier(idNode.name);
            if (target === idNode.name) return;

            const keyNode = path.node.key;
            const insertAt = keyNode.start + idNode.name.length;
            replacements.push({ start: insertAt, end: insertAt, text: `: ${target}` });
        },

        Identifier(path) {
            const { node, parent } = path;
            const name = node.name;

            if (name === 'this') {
                return;
            }

            // Private name (`this.#foo`, `#foo` declaration): a class member in its own namespace.
            if (parent?.type === 'PrivateName') {
                return;
            }

            // Type-space declaration ids are handled by the dedicated type-decl visitor.
            if (isTypeDeclId(parent, node)) {
                return;
            }

            // Shorthand object properties are fully handled by the ObjectProperty visitor.
            if (parent?.type === 'ObjectProperty' && parent.shorthand) {
                return;
            }

            // Default value of a shorthand pattern: handled by the ObjectProperty visitor.
            if (
                parent?.type === 'AssignmentPattern' &&
                parent.left === node &&
                path.parentPath?.parent?.type === 'ObjectProperty' &&
                path.parentPath.parent.shorthand
            ) {
                return;
            }

            // Value references in type space are handled by the dedicated type visitors.
            if (isInTypeContext(path)) {
                return;
            }

            if (isPreservedPosition(path)) {
                return;
            }

            if (!resolvesToRenameableValue(path, name)) {
                return;
            }

            pushRename(node);
        },

        // Rename type-parameter declarations (`<T>`, mapped-type keys, `infer` vars). References
        // ride the TSTypeReference path via resolvesToRenameableType.
        TSTypeParameter(path) {
            pushRenameTypeParam(path.node);
        },

        // Rename type-alias / interface declaration names.
        TSTypeAliasDeclaration(path) {
            const id = path.node.id;
            if (id?.type === 'Identifier' && renameableTypeNames.has(id.name)) pushRename(id);
        },
        TSInterfaceDeclaration(path) {
            const id = path.node.id;
            if (id?.type === 'Identifier' && renameableTypeNames.has(id.name)) pushRename(id);
        },

        // Type references: classes/enums (via value binding) and type-space names.
        TSTypeReference(path) {
            const idNode = leftmostEntityIdentifier(path.node.typeName);
            if (!idNode) return;
            if (!resolvesToRenameableType(path, idNode.name)) return;
            pushRename(idNode);
        },

        // Heritage clauses (`implements X`, interface `extends X` — both are
        // TSExpressionWithTypeArguments in this Babel version).
        TSExpressionWithTypeArguments(path) {
            const expr = path.node.expression;
            if (!expr) return;
            const idNode = leftmostExprIdentifier(expr);
            if (!idNode) return;
            if (!resolvesToRenameableType(path, idNode.name)) return;
            pushRename(idNode);
        },

        // `typeof X` references a value binding, or a type-only import of a value (which TS
        // permits in a type query). Both must rename in lockstep with their declaration.
        TSTypeQuery(path) {
            const idNode = leftmostEntityIdentifier(path.node.exprName);
            if (!idNode) return;
            if (!resolvesToRenameableType(path, idNode.name)) return;
            pushRename(idNode);
        },

        // Computed type-member key (`interface I { [HostElementKey]: T }`). The key references a
        // value binding or a type-only import used as a key; both must rename in lockstep.
        'TSPropertySignature|TSMethodSignature'(path) {
            if (!path.node.computed) return;
            const keyNode = path.node.key;
            if (!keyNode || keyNode.type !== 'Identifier') return;
            if (!resolvesToRenameableType(path, keyNode.name)) return;
            pushRename(keyNode);
        },

        // `value is Foo` / `asserts value` references the parameter binding from type space.
        TSTypePredicate(path) {
            const pn = path.node.parameterName;
            if (!pn || pn.type !== 'Identifier') return;
            if (!resolvesToRenameableValue(path, pn.name)) return;
            pushRename(pn);
        },
    });

    // Restructures an inline `export <decl>` into a renamed declaration plus a trailing aliased
    // export specifier, so the declaration's local name is renamed while the export name (the
    // cross-module contract) is preserved.
    function emitInlineExportRestructure(path) {
        const node = path.node;
        const decl = node.declaration;

        // An overload signature (`export function f(): void;`) shares the binding with its
        // implementation, which emits the re-export. TS requires every overload AND the
        // implementation to agree on `export`, so strip `export ` here and emit no specifier.
        if (decl.type === 'TSDeclareFunction') {
            if (decl.id?.type === 'Identifier' && resolvesToRenameableValue(path, decl.id.name)) {
                replacements.push({ start: node.start, end: decl.start, text: '' });
            }
            return;
        }

        // (name, isType) entries for every binding the declaration exports.
        const entries = [];
        if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') {
            if (decl.id?.type === 'Identifier') entries.push({ name: decl.id.name, isType: false });
        } else if (decl.type === 'VariableDeclaration') {
            for (const d of decl.declarations) {
                const names = [];
                collectPatternBindings(d.id, names);
                names.forEach((n) => entries.push({ name: n, isType: false }));
            }
        } else if (
            decl.type === 'TSInterfaceDeclaration' ||
            decl.type === 'TSTypeAliasDeclaration'
        ) {
            // A type that merges with a value export of the same name is already re-exported by
            // the value specifier (which carries both meanings); a second `type` re-export would
            // duplicate the identifier. Still strip `export ` and rename the declaration body.
            if (decl.id?.type === 'Identifier' && !valueExportedNames.has(decl.id.name)) {
                entries.push({ name: decl.id.name, isType: true });
            }
        } else {
            return; // enums, modules, etc. are preserved
        }
        if (entries.length === 0) {
            // Type half of a value+type merge: drop `export ` so the renamed declaration stays
            // local; the value half's specifier re-exports the (shared) name.
            if (
                (decl.type === 'TSInterfaceDeclaration' ||
                    decl.type === 'TSTypeAliasDeclaration') &&
                decl.id?.type === 'Identifier' &&
                renameableTypeNames.has(decl.id.name) &&
                transformIdentifier(decl.id.name) !== decl.id.name
            ) {
                replacements.push({ start: node.start, end: decl.start, text: '' });
            }
            return;
        }

        const specs = [];
        let anyRenamed = false;
        for (const e of entries) {
            let target = null;
            if (e.isType) {
                if (renameableTypeNames.has(e.name)) target = transformIdentifier(e.name);
            } else {
                const binding = path.scope.getBinding(e.name);
                if (binding && renameableIds.has(binding.identifier)) {
                    target = transformIdentifier(e.name);
                }
            }
            if (target && target !== e.name) {
                anyRenamed = true;
                specs.push(`${e.isType ? 'type ' : ''}${target} as ${e.name}`);
            } else {
                specs.push(`${e.isType ? 'type ' : ''}${e.name}`);
            }
        }
        if (!anyRenamed) return;

        // Strip the `export ` keyword; the declaration body is rewritten by the other visitors.
        replacements.push({ start: node.start, end: decl.start, text: '' });
        // Append the aliased re-export after the (now local) declaration.
        replacements.push({
            start: node.end,
            end: node.end,
            text: `\nexport { ${specs.join(', ')} };`,
        });
    }

    // Apply replacements from end to start to keep earlier offsets valid. Dedupe only real token
    // replacements (start !== end) by position; keep every zero-width insert so adjacent aliases
    // compose. Tie-break by end descending so an insert at a token's end applies before a
    // replacement of that token does not occur (disjoint ranges), and equal inserts keep order.
    const seen = new Set();
    const deduped = [];
    for (const r of replacements) {
        if (r.start !== r.end) {
            const key = `${r.start}:${r.end}`;
            if (seen.has(key)) continue;
            seen.add(key);
        }
        deduped.push(r);
    }
    const ordered = deduped
        .map((r, i) => ({ r, i }))
        .sort((a, b) => b.r.start - a.r.start || b.r.end - a.r.end || a.i - b.i)
        .map((x) => x.r);

    let result = source;
    for (const r of ordered) {
        result = result.slice(0, r.start) + r.text + result.slice(r.end);
    }
    return result;
}
