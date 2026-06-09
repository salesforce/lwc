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

    // First pass: collect all identifiers that create bindings or have syntax constraints
    const importedIdentifiers = new Set();
    const parameterNames = new Set();
    const destructuredIdentifiers = new Set();
    const shorthandPropertyIdentifiers = new Set();

    traverse(ast, {
        // Collect all imported identifiers
        ImportDeclaration(path) {
            path.node.specifiers.forEach((spec) => {
                if (spec.local && spec.local.type === 'Identifier') {
                    importedIdentifiers.add(spec.local.name);
                }
            });
        },

        // Collect all identifiers used in shorthand properties { x } which means { x: x }
        ObjectProperty(path) {
            if (path.node.shorthand && path.node.value.type === 'Identifier') {
                shorthandPropertyIdentifiers.add(path.node.value.name);
            }
        },

        // Collect all function parameter names
        'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ObjectMethod|ClassMethod'(
            path
        ) {
            path.node.params.forEach((param) => {
                if (param.type === 'Identifier') {
                    parameterNames.add(param.name);
                } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
                    parameterNames.add(param.left.name);
                } else if (param.type === 'RestElement' && param.argument.type === 'Identifier') {
                    parameterNames.add(param.argument.name);
                }
                // Also handle destructuring parameters
                if (param.type === 'ObjectPattern') {
                    param.properties.forEach((prop) => {
                        if (prop.type === 'ObjectProperty' && prop.value.type === 'Identifier') {
                            parameterNames.add(prop.value.name);
                        }
                    });
                }
                if (param.type === 'ArrayPattern') {
                    param.elements.forEach((el) => {
                        if (el && el.type === 'Identifier') {
                            parameterNames.add(el.name);
                        }
                    });
                }
            });
        },

        // Collect all identifiers created by destructuring (const { x } = ..., const [y] = ...)
        VariableDeclarator(path) {
            function collectFromPattern(pattern) {
                if (pattern.type === 'ObjectPattern') {
                    pattern.properties.forEach((prop) => {
                        if (prop.type === 'ObjectProperty') {
                            if (prop.value.type === 'Identifier') {
                                destructuredIdentifiers.add(prop.value.name);
                            } else if (
                                prop.value.type === 'ObjectPattern' ||
                                prop.value.type === 'ArrayPattern'
                            ) {
                                collectFromPattern(prop.value);
                            }
                        } else if (
                            prop.type === 'RestElement' &&
                            prop.argument.type === 'Identifier'
                        ) {
                            destructuredIdentifiers.add(prop.argument.name);
                        }
                    });
                } else if (pattern.type === 'ArrayPattern') {
                    pattern.elements.forEach((el) => {
                        if (el && el.type === 'Identifier') {
                            destructuredIdentifiers.add(el.name);
                        } else if (
                            el &&
                            (el.type === 'ObjectPattern' || el.type === 'ArrayPattern')
                        ) {
                            collectFromPattern(el);
                        } else if (
                            el &&
                            el.type === 'RestElement' &&
                            el.argument.type === 'Identifier'
                        ) {
                            destructuredIdentifiers.add(el.argument.name);
                        }
                    });
                }
            }

            if (
                path.node.id &&
                (path.node.id.type === 'ObjectPattern' || path.node.id.type === 'ArrayPattern')
            ) {
                collectFromPattern(path.node.id);
            }
        },
    });

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
        // Skip imported identifiers (from any import statement)
        if (importedIdentifiers.has(name)) {
            return true;
        }

        // Skip function parameter names (anywhere they appear)
        if (parameterNames.has(name)) {
            return true;
        }

        // Skip destructured identifiers (from const { x } = ..., etc.)
        if (destructuredIdentifiers.has(name)) {
            return true;
        }

        // Skip identifiers used in shorthand properties ({ x } means { x: x })
        if (shorthandPropertyIdentifiers.has(name)) {
            return true;
        }

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
