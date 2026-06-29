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
 * Returns the source offset where a type parameter's NAME begins. `TSTypeParameter` exposes its
 * name as a plain string with no inner node, so when the param carries a modifier (`in`/`out`
 * variance or `const`) `node.start` points at the modifier keyword, not the name. Consume a
 * leading run of whole `const`/`in`/`out` keywords (each `\b`-anchored with trailing whitespace)
 * from the source slice so the name slice clears the keyword; with no modifier this is `node.start`.
 */
function typeParamNameStart(tpNode, source) {
    if (!(tpNode.in || tpNode.out || tpNode.const)) return tpNode.start;
    const slice = source.slice(tpNode.start, tpNode.end);
    const match = slice.match(/^(?:(?:const|in|out)\b\s+)+/);
    return tpNode.start + (match ? match[0].length : 0);
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
 * Whether an enum name appears in a value position the emit phase leaves ASCII. An enum has no
 * module-boundary alias, and the value path renames only member-access objects (`Enum.MEMBER`)
 * and bare value references; object shorthand (`{ Enum }`, handled by the ObjectProperty visitor)
 * and import/export specifiers (a preserved position with no enum alias) stay ASCII. Such an
 * occurrence would desync from the renamed declaration, so the prescan drops the enum entirely.
 */
function isUncoveredEnumValueReference(path) {
    const { node, parent } = path;
    // The declaration id and member-key ids are not references; they are handled (or preserved)
    // by the dedicated enum visitor.
    if (parent?.type === 'TSEnumDeclaration' && parent.id === node) return false;
    if (parent?.type === 'TSEnumMember') return false;
    // Object shorthand `{ Enum }` (and its shorthand-default form) is not renamed for enums.
    if (parent?.type === 'ObjectProperty' && parent.shorthand) return true;
    if (
        parent?.type === 'AssignmentPattern' &&
        parent.left === node &&
        path.parentPath?.parent?.type === 'ObjectProperty' &&
        path.parentPath.parent.shorthand
    ) {
        return true;
    }
    // `export { Enum }` carries no enum alias, so the export visitor leaves the specifier ASCII.
    // (Import specifiers are listed defensively to mirror the emit-side preserved positions; a
    // module-local enum is never imported, and an imported same-named identifier has a scope
    // binding that the caller's `getBinding` guard excludes before reaching here.)
    return (
        parent?.type === 'ImportSpecifier' ||
        parent?.type === 'ImportDefaultSpecifier' ||
        parent?.type === 'ImportNamespaceSpecifier' ||
        parent?.type === 'ExportSpecifier'
    );
}

/**
 * Whether an enum-name identifier is the object of a computed access that exposes a member name as
 * a string — `E['Member']` in value space (a `MemberExpression`/`OptionalMemberExpression` with
 * `computed: true`) or `E['Member']` in type space (a `TSTypeReference` used as the `objectType`
 * of a `TSIndexedAccessType`). Such access reads a member by string literal, so renaming the
 * member key would desync; the prescan disqualifies the enum's members from renaming.
 */
function exposesEnumMemberAsString(path) {
    const { node, parent } = path;
    if (
        (parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression') &&
        parent.object === node &&
        parent.computed
    ) {
        return true;
    }
    if (parent?.type === 'TSTypeReference') {
        const gp = path.parentPath?.parent;
        return gp?.type === 'TSIndexedAccessType' && gp.objectType === parent;
    }
    // `keyof typeof E` is the union of the member-key string literals, so renaming the keys would
    // desync any string constrained to that type. `E` here is the `exprName` of a `TSTypeQuery`
    // (`typeof E`) whose parent is a `keyof` `TSTypeOperator`.
    if (parent?.type === 'TSTypeQuery' && parent.exprName === node) {
        const gp = path.parentPath?.parent;
        return gp?.type === 'TSTypeOperator' && gp.operator === 'keyof';
    }
    return false;
}

/**
 * Collects bare identifier-reference names within a node into `out`. Used to detect, in a const-enum
 * declaration, whether a member initializer references a sibling member name as a bare identifier
 * (`B = A << 1`), which would desync if the member keys were renamed. Member-access property
 * positions (`E.A`, where `A` is the non-computed property) are skipped: those already rename in
 * lockstep via the dedicated member-access visitors, so they are not a desync source.
 */
function collectIdentifierNames(node, out) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'Identifier') {
        out.add(node.name);
        return;
    }
    for (const key of Object.keys(node)) {
        if (
            (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') &&
            key === 'property' &&
            !node.computed
        ) {
            continue;
        }
        if (node.type === 'TSQualifiedName' && key === 'right') continue;
        const value = node[key];
        if (Array.isArray(value)) {
            for (const child of value) collectIdentifierNames(child, out);
        } else {
            collectIdentifierNames(value, out);
        }
    }
}

/**
 * Transforms identifiers in the source code. Module-scope imports and exports are renamed with
 * the cross-module string contract preserved via aliasing at the boundary; references (value and
 * type) are rewritten to the renamed local.
 */
export function transformSource(ast, source, analysis) {
    const { publicIdentifiers, exportedClassLocals } = analysis;
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

    // Non-exported enum names. An enum is a dual value+type binding, but Babel registers no scope
    // binding for it, so it cannot ride the binding-keyed value path; it is renamed by this
    // name-keyed set instead. The enum NAME always moves; members move only for the const-enum
    // subset below. Exported enums stay ASCII entirely — there is no module-boundary alias for an
    // enum, and the analyzer protects exported members as a cross-module contract.
    const renameableEnumNames = new Set();

    // Const enums whose MEMBER names are also renameable. A `const enum` has no runtime object —
    // TypeScript inlines every `E.Member` at compile time — so the member names are compile-time
    // only and safe to rename, provided every member is an Identifier key and every reference is a
    // covered `E.Member` access (value member expression or type qualified name). Any computed
    // access (`E['Member']`) would desync; the Pass A3 prescan drops such an enum from this set.
    const memberRenameableEnumNames = new Set();

    function isExportedDecl(path) {
        return (
            path.parent?.type === 'ExportNamedDeclaration' ||
            path.parent?.type === 'ExportDefaultDeclaration'
        );
    }

    traverse(ast, {
        TSTypeAliasDeclaration(path) {
            considerTypeName(path.node.id?.name);
        },
        TSInterfaceDeclaration(path) {
            considerTypeName(path.node.id?.name);
        },
        TSEnumDeclaration(path) {
            if (isExportedDecl(path)) return;
            const name = path.node.id?.name;
            if (!name) return;
            if (GLOBAL_IDENTIFIERS.has(name)) return;
            if (publicIdentifiers.has(name)) return;
            renameableEnumNames.add(name);
            const members = path.node.members || [];
            if (path.node.const && members.every((m) => m.id?.type === 'Identifier')) {
                // A member initializer that references a sibling member by name (`B = A << 1`)
                // would desync: the key declaration renames but the bare reference does not. Only
                // claim member renaming when no initializer references a member key name.
                const memberKeyNames = new Set(members.map((m) => m.id.name));
                const initializerNames = new Set();
                for (const m of members) collectIdentifierNames(m.initializer, initializerNames);
                const referencesSibling = [...initializerNames].some((n) => memberKeyNames.has(n));
                if (!referencesSibling) {
                    memberRenameableEnumNames.add(name);
                }
            }
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

    // ECMAScript private `#` member names (`#foo` fields/methods, `this.#foo` access). A private
    // name lives in a per-class lexical namespace — never a runtime string property, never emitted
    // to `.d.ts`, never observable externally — so renaming it is safe. Every occurrence is a
    // `PrivateName` node, so a name-keyed file-global set keeps declaration and access in lockstep.
    const privateNameNames = new Set();

    traverse(ast, {
        TSTypeParameter(path) {
            const node = path.node;
            const name = typeParamName(node);
            if (!name) return;
            if (GLOBAL_IDENTIFIERS.has(name)) return;
            if (publicIdentifiers.has(name)) return;
            typeParamNames.add(name);
        },
        PrivateName(path) {
            const name = path.node.id?.name;
            if (!name) return;
            if (GLOBAL_IDENTIFIERS.has(name)) return;
            privateNameNames.add(name);
        },
    });

    // --- Pass A2d: TS `private` members of non-exported classes -----------------------------
    // A `private` member of a class that is neither exported nor a LightningElement component is
    // confined to its own file: TS forbids access from outside the class body, the class appears
    // in no published `.d.ts`, and it is bound to no template. So renaming its declaration key plus
    // every in-class `this.X` / `const {X}=this` access is invisible externally. Unlike a `#`-field
    // (whose `this.#x` is syntactically distinct), `this.X` is identical to a public access on
    // another object, so the rename is scoped to the specific class NODE — never name-keyed alone.
    const scopedPrivateMembersByClass = new Map(); // ClassNode -> Set<string>
    const scopedPrivateClasses = new Set(); // ClassNode

    function extendsLightningElement(superClass) {
        if (!superClass) return false;
        if (superClass.type === 'Identifier') return superClass.name === 'LightningElement';
        if (superClass.type === 'MemberExpression' && superClass.property?.type === 'Identifier') {
            return superClass.property.name === 'LightningElement';
        }
        return false;
    }

    function isInternalClass(path) {
        if (isExportedDecl(path)) return false;
        const id = path.node.id;
        if (id?.type === 'Identifier' && exportedClassLocals.has(id.name)) return false;
        if (extendsLightningElement(path.node.superClass)) return false;
        return true;
    }

    traverse(ast, {
        'ClassDeclaration|ClassExpression'(path) {
            if (!isInternalClass(path)) return;
            const names = new Set();
            for (const member of path.node.body.body) {
                if (
                    member.type !== 'ClassMethod' &&
                    member.type !== 'ClassProperty' &&
                    member.type !== 'ClassAccessorProperty'
                ) {
                    continue;
                }
                if (member.computed || member.accessibility !== 'private') continue;
                if (member.key?.type !== 'Identifier') continue;
                const name = member.key.name;
                if (GLOBAL_IDENTIFIERS.has(name) || publicIdentifiers.has(name)) continue;
                names.add(name);
            }
            if (names.size > 0) {
                scopedPrivateMembersByClass.set(path.node, names);
                scopedPrivateClasses.add(path.node);
            }
        },
    });

    // Resolves the nearest enclosing class node that is in `scopedPrivateClasses`, or null. The
    // walk stops at a `this`-rebinding boundary — a non-arrow `function` expression/declaration or
    // an object method — reached before the class: inside such a function `this` is whatever the
    // function is called on, NOT the class instance, so a `this.X` there is not a member access and
    // must not be treated as one. Arrow functions, class methods, and field initializers keep the
    // lexical/instance `this`, so they do not stop the walk.
    function enclosingScopedClass(path) {
        const boundary = path.findParent(
            (p) =>
                p.isClassDeclaration() ||
                p.isClassExpression() ||
                p.isFunctionDeclaration() ||
                p.isFunctionExpression() ||
                p.isObjectMethod()
        );
        if (!boundary) return null;
        if (!boundary.isClassDeclaration() && !boundary.isClassExpression()) return null;
        return scopedPrivateClasses.has(boundary.node) ? boundary.node : null;
    }

    // The nearest enclosing scoped class IGNORING `this`-rebinding function boundaries. Used only by
    // the prescan: a `this.X` that `enclosingScopedClass` rejects (because a non-arrow function
    // rebinds `this`) but that lexically sits inside a scoped class declaring `X` is ambiguous — the
    // function's runtime `this` MIGHT be the instance — so the member must be dropped, not renamed.
    function rawEnclosingScopedClass(path) {
        const classPath = path.findParent((p) => p.isClassDeclaration() || p.isClassExpression());
        if (classPath && scopedPrivateClasses.has(classPath.node)) return classPath.node;
        return null;
    }

    // Whether a path is a `this.X` non-computed member access whose `X` is a scoped private member.
    function scopedThisMemberName(path) {
        const { node, parent } = path;
        if (
            (parent?.type !== 'MemberExpression' && parent?.type !== 'OptionalMemberExpression') ||
            parent.property !== node ||
            parent.computed ||
            parent.object?.type !== 'ThisExpression'
        ) {
            return null;
        }
        const classNode = enclosingScopedClass(path);
        if (!classNode) return null;
        return scopedPrivateMembersByClass.get(classNode).has(node.name) ? classNode : null;
    }

    // Whether a path is the key of an object-pattern shorthand destructuring `this` (`const {X}=this`)
    // whose `X` is a scoped private member of the enclosing class.
    function scopedThisPatternName(path) {
        const { node, parent } = path;
        if (parent?.type !== 'ObjectProperty' || !parent.shorthand || parent.key !== node) {
            return null;
        }
        const objPattern = path.parentPath?.parent;
        if (objPattern?.type !== 'ObjectPattern') return null;
        const declarator = path.parentPath?.parentPath?.parent;
        if (
            declarator?.type !== 'VariableDeclarator' ||
            declarator.init?.type !== 'ThisExpression'
        ) {
            return null;
        }
        const classNode = enclosingScopedClass(path);
        if (!classNode) return null;
        return scopedPrivateMembersByClass.get(classNode).has(node.name) ? classNode : null;
    }

    // In a shorthand `const {X}=this`, Babel stores distinct key and value Identifier nodes at the
    // same source span. `scopedThisPatternName` matches only the KEY (so emit renames the single
    // token once); the prescan must also recognize the VALUE node — the introduced binding — as
    // covered, else it would treat it as an uncovered occurrence and drop the member.
    function isScopedThisPatternValue(path) {
        const { node, parent } = path;
        if (parent?.type !== 'ObjectProperty' || !parent.shorthand || parent.value !== node) {
            return false;
        }
        return !!scopedThisPatternName(path.parentPath.get('key'));
    }

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
    const unsafeEnumNames = new Set();
    const unsafeEnumMemberNames = new Set();

    traverse(ast, {
        Identifier(path) {
            const { node, parent } = path;
            const name = node.name;
            // A const enum whose member is read by string (`E['Member']`, value or type) cannot
            // have its member keys renamed without desyncing that string. Disqualify member
            // renaming (the enum NAME still renames via the checks below / its own path).
            if (memberRenameableEnumNames.has(name) && exposesEnumMemberAsString(path)) {
                unsafeEnumMemberNames.add(name);
            }
            // Value-position enum references the emit phase leaves ASCII (object shorthand,
            // import/export specifiers) would desync from the renamed declaration. Inspect these
            // before the type-context guard, since they live in value space.
            if (
                renameableEnumNames.has(name) &&
                !path.scope.getBinding(name) &&
                isUncoveredEnumValueReference(path)
            ) {
                unsafeEnumNames.add(name);
                return;
            }
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
            if (renameableEnumNames.has(name)) {
                unsafeEnumNames.add(name);
            }
        },
    });

    for (const id of unsafeValueIds) renameableIds.delete(id);
    for (const n of unsafeTypeNames) renameableTypeNames.delete(n);
    for (const n of unsafeTypeParamNames) typeParamNames.delete(n);
    for (const n of unsafeEnumNames) renameableEnumNames.delete(n);
    // An enum dropped from name renaming (uncovered value reference) also loses member renaming:
    // if the name desyncs we leave the whole declaration ASCII.
    for (const n of unsafeEnumNames) memberRenameableEnumNames.delete(n);
    for (const n of unsafeEnumMemberNames) memberRenameableEnumNames.delete(n);

    // --- Pass A3b: scoped-private-member coverage prescan -----------------------------------
    // Only three occurrence forms of a scoped private member rename in lockstep: the member-key
    // declaration, a non-computed `this.X`, and a `const {X}=this` shorthand key. Any OTHER
    // occurrence of that name lexically inside its class — a same-name access on a different object
    // (`obj.X`), a computed `this['X']`, or a string/template literal equal to the name — could
    // desync from the renamed declaration, so drop that `(classNode, name)` and leave it ASCII.
    function dropScopedMember(classNode, name) {
        const set = scopedPrivateMembersByClass.get(classNode);
        if (set) set.delete(name);
    }
    // Whether a path is the property of a non-computed `this.X` member access (`X === node`),
    // regardless of any `this`-rebinding function boundary between it and a class.
    function isSyntacticThisMember(path) {
        const { node, parent } = path;
        return (
            (parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression') &&
            parent.property === node &&
            !parent.computed &&
            parent.object?.type === 'ThisExpression'
        );
    }
    traverse(ast, {
        Identifier(path) {
            const { node, parent } = path;
            const name = node.name;
            const classNode = enclosingScopedClass(path);
            if (!classNode) {
                // A `this.X` sitting inside a `this`-rebinding function (so `enclosingScopedClass`
                // bailed) but lexically within a scoped class declaring `X` is ambiguous: that
                // function's runtime `this` might be the instance. Drop the member to stay ASCII
                // everywhere rather than rename the declaration while this access cannot follow.
                if (isSyntacticThisMember(path)) {
                    const rawClass = rawEnclosingScopedClass(path);
                    if (rawClass && scopedPrivateMembersByClass.get(rawClass).has(name)) {
                        dropScopedMember(rawClass, name);
                    }
                }
                return;
            }
            if (!scopedPrivateMembersByClass.get(classNode).has(name)) return;
            // The member-key declaration is covered.
            if (
                (parent?.type === 'ClassMethod' ||
                    parent?.type === 'ClassProperty' ||
                    parent?.type === 'ClassAccessorProperty') &&
                parent.key === node &&
                !parent.computed
            ) {
                return;
            }
            if (scopedThisMemberName(path)) return; // non-computed `this.X` is covered
            if (scopedThisPatternName(path)) return; // `const {X}=this` shorthand key is covered
            if (isScopedThisPatternValue(path)) return; // its shorthand value node is covered too
            // A bare reference that resolves to its own renameable scope binding (e.g. the local
            // introduced by `const {X}=this`, or any same-named local/param) is NOT a member
            // access — the value path renames it independently, to the same confusable by
            // determinism — so it never desyncs the member and must not trigger a drop.
            if (resolvesToRenameableValue(path, name)) return;
            dropScopedMember(classNode, name);
        },
        'StringLiteral|TemplateElement'(path) {
            const value =
                path.node.type === 'StringLiteral' ? path.node.value : path.node.value?.cooked;
            if (value == null) return;
            const classNode = enclosingScopedClass(path);
            if (!classNode) return;
            if (scopedPrivateMembersByClass.get(classNode).has(value)) {
                dropScopedMember(classNode, value);
            }
        },
    });
    for (const classNode of scopedPrivateClasses) {
        if (scopedPrivateMembersByClass.get(classNode).size === 0) {
            scopedPrivateClasses.delete(classNode);
        }
    }

    function resolvesToRenameableType(path, name) {
        if (GLOBAL_IDENTIFIERS.has(name)) return false;
        if (resolvesToRenameableValue(path, name)) return true;
        if (renameableTypeNames.has(name)) return true;
        if (renameableEnumNames.has(name)) return true;
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
    // is `[nameStart, nameStart + name.length)` where `nameStart` clears any leading modifier
    // keyword (`const`/`in`/`out`); the `extends`/`default` clause that follows (covered by
    // node.end) is left untouched.
    function pushRenameTypeParam(tpNode) {
        const name = typeParamName(tpNode);
        if (!name) return;
        if (!typeParamNames.has(name)) return; // dropped by the coverage prescan, or guarded out
        const target = transformIdentifier(name);
        if (target === name) return;
        const nameStart = typeParamNameStart(tpNode, source);
        replacements.push({
            start: nameStart,
            end: nameStart + name.length,
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

            // A `const {X}=this` shorthand whose key is a scoped private member is renamed as a
            // single token by the Identifier visitor (key and binding share one source position),
            // so the generic key-preserving expansion must NOT run here — it would strand the key.
            if (path.node.key?.type === 'Identifier' && scopedThisPatternName(path.get('key'))) {
                return;
            }

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

            // A scoped private member accessed as `this.X` (a preserved member position) or as a
            // `const {X}=this` shorthand key (otherwise routed to the ObjectProperty visitor) must
            // rename in lockstep with its declaration. Handle both here — before the member-position
            // and shorthand early-returns below — scoped to the specific class node. For the
            // shorthand, key === value is one source token, so a single slice renames the property
            // name and the introduced binding together (determinism keeps later binding refs aligned).
            if (scopedThisMemberName(path) || scopedThisPatternName(path)) {
                pushRename(node);
                return;
            }

            // Type-space declaration ids are handled by the dedicated type-decl visitor.
            if (isTypeDeclId(parent, node)) {
                return;
            }

            // Enum declaration ids and member ids are handled by the dedicated TSEnumDeclaration
            // visitor / left ASCII; never rename them through the value path.
            if (parent?.type === 'TSEnumDeclaration' && parent.id === node) {
                return;
            }
            if (parent?.type === 'TSEnumMember') {
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

            // A const-enum member access (`E.Member`): the member key renames with the enum, so the
            // `.Member` property — normally a preserved member position — must rename in lockstep.
            if (
                (parent?.type === 'MemberExpression' ||
                    parent?.type === 'OptionalMemberExpression') &&
                parent.property === node &&
                !parent.computed &&
                parent.object?.type === 'Identifier' &&
                memberRenameableEnumNames.has(parent.object.name) &&
                !path.scope.getBinding(parent.object.name)
            ) {
                pushRename(node);
                return;
            }

            if (isPreservedPosition(path)) {
                return;
            }

            if (!resolvesToRenameableValue(path, name)) {
                // An enum value reference (`Enum.MEMBER`) resolves to no scope binding, so it
                // falls through here. Rename it iff the name is a renameable enum AND no binding
                // shadows it — a same-named local binding would own this occurrence instead.
                if (renameableEnumNames.has(name) && !path.scope.getBinding(name)) {
                    pushRename(node);
                }
                return;
            }

            pushRename(node);
        },

        // Rename type-parameter declarations (`<T>`, mapped-type keys, `infer` vars). References
        // ride the TSTypeReference path via resolvesToRenameableType.
        TSTypeParameter(path) {
            pushRenameTypeParam(path.node);
        },

        // Rename a scoped private member's declaration key (`private X` / `private X()`). The key
        // is a preserved member position for the Identifier visitor, so it is renamed here instead.
        // `this.X` accesses rename via the Identifier visitor's scoped-private branch in lockstep.
        'ClassMethod|ClassProperty|ClassAccessorProperty'(path) {
            const { node } = path;
            if (node.computed || node.key?.type !== 'Identifier') return;
            const classPath = path.findParent(
                (p) => p.isClassDeclaration() || p.isClassExpression()
            );
            if (!classPath || !scopedPrivateClasses.has(classPath.node)) return;
            if (scopedPrivateMembersByClass.get(classPath.node).has(node.key.name)) {
                pushRename(node.key);
            }
        },

        // Rename private `#` member declarations and `this.#foo` access in lockstep. The inner
        // Identifier starts after the `#` (the leading `#` is part of the PrivateName, not the
        // Identifier), so slicing `[id.start, id.end)` renames the name and leaves `#` intact.
        PrivateName(path) {
            const id = path.node.id;
            if (id?.type !== 'Identifier' || !privateNameNames.has(id.name)) return;
            const target = transformIdentifier(id.name);
            if (target === id.name) return;
            replacements.push({ start: id.start, end: id.end, text: target });
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

        // Rename a non-exported enum's declaration name. For a const enum that survived the member
        // prescan, also rename each member-key declaration; its `E.Member` references rename in
        // lockstep via the value Identifier and TSQualifiedName visitors. A plain enum keeps its
        // members ASCII (runtime object with reverse mapping). The name's type and value references
        // rename through resolvesToRenameableType and the value Identifier visitor respectively.
        TSEnumDeclaration(path) {
            const id = path.node.id;
            if (id?.type !== 'Identifier' || !renameableEnumNames.has(id.name)) return;
            pushRename(id);
            if (!memberRenameableEnumNames.has(id.name)) return;
            for (const member of path.node.members || []) {
                if (member.id?.type === 'Identifier') pushRename(member.id);
            }
        },

        // Type references: classes/enums (via value binding) and type-space names.
        TSTypeReference(path) {
            const idNode = leftmostEntityIdentifier(path.node.typeName);
            if (!idNode) return;
            if (!resolvesToRenameableType(path, idNode.name)) return;
            pushRename(idNode);
        },

        // A const-enum member used as a type (`E.Member`): the `right` of the qualified name is the
        // member key, which renames in lockstep with the member-key declaration. The `left` (the
        // enum name) renames via the TSTypeReference visitor above.
        TSQualifiedName(path) {
            const { left, right } = path.node;
            if (
                left?.type === 'Identifier' &&
                right?.type === 'Identifier' &&
                memberRenameableEnumNames.has(left.name)
            ) {
                pushRename(right);
            }
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
