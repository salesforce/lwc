import traverseModule from '@babel/traverse';
import { CONFUSABLES } from './confusables-map.mjs';
import { simpleHash } from './hash.mjs';
import { GLOBAL_IDENTIFIERS } from './globals.mjs';

// ESM/CommonJS compatibility
const traverse = traverseModule.default || traverseModule;

// Binding kinds / declaration node types that live in TypeScript type space or otherwise
// must never be renamed (renaming them would desync declarations from references that
// Babel's scope analysis does not track).
const TYPE_SPACE_DECLARATIONS = new Set([
    'TSTypeAliasDeclaration',
    'TSInterfaceDeclaration',
    'TSEnumDeclaration',
    'TSModuleDeclaration',
    'TSImportEqualsDeclaration',
    'TSTypeParameter',
    // Constructor parameter properties (`constructor(private foo)`) create class members
    // accessed via `this.foo`, which scope analysis cannot rename consistently.
    'TSParameterProperty',
]);

// Import bindings are part of a cross-module contract. `binding.kind` is 'module' for value
// imports but 'unknown' for `import type` bindings, so match on the declaration node type
// instead to cover both.
const IMPORT_DECLARATIONS = new Set([
    'ImportSpecifier',
    'ImportDefaultSpecifier',
    'ImportNamespaceSpecifier',
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
 * Transforms an identifier by replacing ASCII characters with confusables.
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
 * Determines whether an identifier path sits in a position where the textual name must be
 * preserved even though a same-named binding exists in scope (property keys, member access,
 * import/export specifiers). Shorthand object properties are handled separately and are NOT
 * skipped here.
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

    // Import/export specifier names.
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
 * Determines whether an identifier path is inside a TypeScript type position. Value references
 * that legitimately appear in type space (`typeof X`, type predicates) are handled by dedicated
 * visitors; everything else in type space is preserved.
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
 * Transforms identifiers in the source code based on AST analysis and scope/binding information.
 *
 * The transform is binding-driven: each binding is classified once as renameable or preserved,
 * then every occurrence (declaration + references) is rewritten consistently or not at all. This
 * structurally prevents declaration/reference divergence.
 */
export function transformSource(ast, source, analysis) {
    const { publicIdentifiers } = analysis;
    const replacements = [];

    // --- Pass A: classify bindings ---------------------------------------------------------
    const renameableIds = new Set(); // binding.identifier nodes that may be renamed

    function isRenameable(binding, name) {
        if (!binding || !binding.identifier) return false;
        if (GLOBAL_IDENTIFIERS.has(name)) return false;
        if (publicIdentifiers.has(name)) return false;
        // Imported names are part of cross-module contracts; this tool transforms each file
        // independently, so imports/exports must be preserved.
        if (binding.kind === 'module') return false;
        if (IMPORT_DECLARATIONS.has(binding.path?.node?.type)) return false;
        if (TYPE_SPACE_DECLARATIONS.has(binding.path?.node?.type)) return false;
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

    function resolvesToRenameable(path, name) {
        const binding = path.scope.getBinding(name);
        return binding && renameableIds.has(binding.identifier) ? binding : null;
    }

    // --- Pass B: emit replacements ----------------------------------------------------------
    traverse(ast, {
        // Expand shorthand object properties so the key (which must match either the source
        // object property in a pattern, or the contextual type in an expression) stays ASCII
        // while the value binding is renamed: `{ scope }` -> `{ scope: <target> }`.
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
                // Destructuring default: `{ scope = x }` -> `{ scope: <target> = x }`
                idNode = valueNode.left;
            }
            if (!idNode) return;

            if (!resolvesToRenameable(path, idNode.name)) return;

            const target = transformIdentifier(idNode.name);
            if (target === idNode.name) return;

            const keyNode = path.node.key;
            const insertAt = keyNode.start + idNode.name.length;
            replacements.push({ start: insertAt, end: insertAt, text: `: ${target}` });
        },

        Identifier(path) {
            const { node, parent } = path;
            const name = node.name;

            // `this` parameter (TS `function (this: T)`) is a contextual keyword, not a binding.
            if (name === 'this') {
                return;
            }

            // Private name (`this.#foo`, `#foo` declaration): the inner identifier is a class
            // member name in its own namespace, not a variable reference. It must never be
            // renamed via scope bindings (a same-named local would otherwise hijack it and
            // desync the `#field` declaration from its uses).
            if (parent?.type === 'PrivateName') {
                return;
            }

            // Shorthand object properties are fully handled by the ObjectProperty visitor.
            if (parent?.type === 'ObjectProperty' && parent.shorthand) {
                return;
            }

            // Default value of a shorthand pattern (`{ key = default }`): the binding is
            // `AssignmentPattern.left`, but the ObjectProperty visitor already expands and renames
            // it. Renaming it again here would corrupt the preserved ASCII key.
            if (
                parent?.type === 'AssignmentPattern' &&
                parent.left === node &&
                path.parentPath?.parent?.type === 'ObjectProperty' &&
                path.parentPath.parent.shorthand
            ) {
                return;
            }

            // Value references inside type space (`typeof X`, `x is T`) are handled by the
            // dedicated visitors below; everything else in type space is preserved.
            if (isInTypeContext(path)) {
                return;
            }

            if (isPreservedPosition(path)) {
                return;
            }

            if (!resolvesToRenameable(path, name)) {
                return;
            }

            const target = transformIdentifier(name);
            if (target === name) return;

            replacements.push({
                start: node.start,
                end: node.start + name.length,
                text: target,
            });
        },

        // A type reference (`x: SignalTracker`) may point at a class declaration, which lives in
        // both value and type space under a single binding. When that class is renamed, its
        // type-position references must rename in lockstep. Restrict to classes: they are the only
        // renameable bindings that can legitimately appear as a direct type reference (aliases,
        // interfaces, enums and imports are preserved). This also avoids a value/type-parameter
        // name collision — `getBinding` only tracks value bindings, so a type reference to a type
        // parameter that shares a name with a renameable value binding would otherwise be renamed
        // out of sync with the preserved type-parameter declaration.
        TSTypeReference(path) {
            const idNode = leftmostEntityIdentifier(path.node.typeName);
            if (!idNode) return;
            const binding = resolvesToRenameable(path, idNode.name);
            if (!binding) return;
            const declType = binding.path?.node?.type;
            if (declType !== 'ClassDeclaration' && declType !== 'ClassExpression') return;

            const target = transformIdentifier(idNode.name);
            if (target === idNode.name) return;

            replacements.push({
                start: idNode.start,
                end: idNode.start + idNode.name.length,
                text: target,
            });
        },

        // `typeof X` references a value binding from type space.
        TSTypeQuery(path) {
            const idNode = leftmostEntityIdentifier(path.node.exprName);
            if (!idNode) return;
            if (!resolvesToRenameable(path, idNode.name)) return;

            const target = transformIdentifier(idNode.name);
            if (target === idNode.name) return;

            replacements.push({
                start: idNode.start,
                end: idNode.start + idNode.name.length,
                text: target,
            });
        },

        // Computed type-member key (`interface I { [HostElementKey]: T }`) references a value
        // binding from type space. The signature lives in type context, so the generic visitor
        // skips it; rename the key reference in lockstep with its value binding.
        'TSPropertySignature|TSMethodSignature'(path) {
            if (!path.node.computed) return;
            const keyNode = path.node.key;
            if (!keyNode || keyNode.type !== 'Identifier') return;
            if (!resolvesToRenameable(path, keyNode.name)) return;

            const target = transformIdentifier(keyNode.name);
            if (target === keyNode.name) return;

            replacements.push({
                start: keyNode.start,
                end: keyNode.start + keyNode.name.length,
                text: target,
            });
        },

        // `value is Foo` / `asserts value` references the parameter binding from type space.
        TSTypePredicate(path) {
            const pn = path.node.parameterName;
            if (!pn || pn.type !== 'Identifier') return;
            if (!resolvesToRenameable(path, pn.name)) return;

            const target = transformIdentifier(pn.name);
            if (target === pn.name) return;

            replacements.push({
                start: pn.start,
                end: pn.start + pn.name.length,
                text: target,
            });
        },
    });

    // Apply replacements from end to start to keep earlier offsets valid. Dedupe by start
    // position so a token is never rewritten twice.
    const seen = new Set();
    const deduped = [];
    for (const r of replacements) {
        const key = `${r.start}:${r.end}`;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(r);
    }
    deduped.sort((a, b) => b.start - a.start);

    let result = source;
    for (const r of deduped) {
        result = result.slice(0, r.start) + r.text + result.slice(r.end);
    }
    return result;
}
