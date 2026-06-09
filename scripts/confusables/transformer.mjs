import traverseModule from '@babel/traverse';
import { CONFUSABLES } from './confusables-map.mjs';
import { simpleHash } from './hash.mjs';
import { GLOBAL_IDENTIFIERS } from './globals.mjs';

// ESM/CommonJS compatibility
const traverse = traverseModule.default || traverseModule;

/**
 * Selects a confusable character deterministically based on the full identifier.
 */
function selectConfusable(char, fullIdentifier, position) {
    const options = CONFUSABLES[char];
    if (!options || options.length === 0) {
        return char;
    }

    // Hash combines full identifier + position for consistency
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
        const transformed = selectConfusable(char, identifier, i);
        result += transformed;
    }
    return result;
}

/**
 * Transforms identifiers in the source code based on AST analysis.
 */
export function transformSource(ast, source, analysis) {
    const replacements = [];
    const { publicIdentifiers } = analysis;

    // Helper to check if we're inside a TypeScript type context
    function isInTypeContext(path) {
        let current = path;
        while (current) {
            const parent = current.parent;
            const type = parent?.type;

            // Check if we're in any TypeScript type-related node
            if (
                type === 'TSTypeAnnotation' ||
                type === 'TSTypeReference' ||
                type === 'TSTypeParameter' ||
                type === 'TSTypeParameterDeclaration' ||
                type === 'TSTypeParameterInstantiation' ||
                type === 'TSQualifiedName' ||
                type === 'TSInterfaceBody' ||
                type === 'TSTypeLiteral' ||
                type === 'TSArrayType' ||
                type === 'TSUnionType' ||
                type === 'TSIntersectionType' ||
                type === 'TSTupleType' ||
                type === 'TSFunctionType' ||
                type === 'TSConstructorType' ||
                type === 'TSIndexedAccessType' ||
                type === 'TSMappedType' ||
                type === 'TSConditionalType' ||
                type === 'TSInferType' ||
                type === 'TSParenthesizedType'
            ) {
                return true;
            }

            // Check if we're the type annotation of an 'as' expression
            if (type === 'TSAsExpression' && parent.typeAnnotation === current.node) {
                return true;
            }

            // Check if we're in a type assertion (<Type>value)
            if (type === 'TSTypeAssertion' && parent.typeAnnotation === current.node) {
                return true;
            }

            // Check if we're the type in a satisfies expression
            if (type === 'TSSatisfiesExpression' && parent.typeAnnotation === current.node) {
                return true;
            }

            current = current.parentPath;
        }
        return false;
    }

    // Helper to check if an identifier should be skipped
    function shouldSkip(path, name) {
        // Skip global identifiers (Object, Array, Map, etc.)
        if (GLOBAL_IDENTIFIERS.has(name)) {
            return true;
        }

        // Skip if in TypeScript type context
        if (isInTypeContext(path)) {
            return true;
        }

        // Skip public identifiers
        if (publicIdentifiers.has(name)) {
            return true;
        }

        // Skip if part of import/export
        if (
            path.parent?.type === 'ImportSpecifier' ||
            path.parent?.type === 'ImportDefaultSpecifier' ||
            path.parent?.type === 'ImportNamespaceSpecifier' ||
            path.parent?.type === 'ExportSpecifier'
        ) {
            return true;
        }

        // Skip if it's a property key in object literal (might be public API)
        // This includes shorthand properties like { get, set }
        if (
            path.parent?.type === 'ObjectProperty' &&
            (path.parent.key === path.node || path.parent.shorthand) &&
            !path.parent.computed
        ) {
            return true;
        }

        // Skip if it's a method key in object/class
        if (
            (path.parent?.type === 'ObjectMethod' || path.parent?.type === 'ClassMethod') &&
            path.parent.key === path.node &&
            !path.parent.computed
        ) {
            return true;
        }

        // Skip if it's a property access (e.g., obj.foo)
        if (
            path.parent?.type === 'MemberExpression' &&
            path.parent.property === path.node &&
            !path.parent.computed
        ) {
            return true;
        }

        // Skip if it's a JSX attribute name
        if (path.parent?.type === 'JSXAttribute' && path.parent.name === path.node) {
            return true;
        }

        // Skip if it's a decorator
        if (path.parent?.type === 'Decorator') {
            return true;
        }

        // Skip if it's a label
        if (path.parent?.type === 'LabeledStatement' && path.parent.label === path.node) {
            return true;
        }

        // Skip if it's a break/continue label
        if (
            (path.parent?.type === 'BreakStatement' || path.parent?.type === 'ContinueStatement') &&
            path.parent.label === path.node
        ) {
            return true;
        }

        return false;
    }

    traverse(ast, {
        Identifier(path) {
            const name = path.node.name;

            if (shouldSkip(path, name)) {
                return;
            }

            // Transform the identifier
            const transformed = transformIdentifier(name);

            if (transformed !== name && path.node.start != null && path.node.end != null) {
                replacements.push({
                    start: path.node.start,
                    end: path.node.end,
                    text: transformed,
                });
            }
        },
    });

    // Apply replacements from end to start (to maintain offsets)
    replacements.sort((a, b) => b.start - a.start);
    let result = source;

    for (const replacement of replacements) {
        result =
            result.slice(0, replacement.start) + replacement.text + result.slice(replacement.end);
    }

    return result;
}
