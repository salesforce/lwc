/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generate } from 'astring';
import { traverse, builders as b, is } from 'estree-toolkit';
import { parseModule } from 'meriyah';

import { LWC_VERSION_COMMENT, type CompilationMode } from '@lwc/shared';
import { LWCClassErrors, SsrCompilerErrors } from '@lwc/errors';
import { transmogrify } from '../transmogrify';
import { ImportManager } from '../imports';
import { replaceLwcImport, replaceNamedLwcExport, replaceAllLwcExport } from './lwc-import';
import { catalogStaticStylesheets, catalogAndReplaceStyleImports } from './stylesheets';
import { addGenerateMarkupFunction } from './generate-markup';
import { catalogWireAdapters, isWireDecorator } from './decorators/wire';
import { validateApiProperty, validateApiMethod } from './decorators/api/validate';
import { isApiDecorator } from './decorators/api';

import { removeDecoratorImport } from './remove-decorator-import';

import { type Visitors, type ComponentMetaState } from './types';
import { validateUniqueDecorator } from './decorators';
import { generateError } from './errors';
import type { ComponentTransformOptions } from '../shared';
import type {
    Identifier as EsIdentifier,
    Program as EsProgram,
    PropertyDefinition as EsPropertyDefinition,
    MethodDefinition as EsMethodDefinition,
    Comment as EsComment,
    Expression as EsExpression,
} from 'estree';

const visitors: Visitors = {
    $: { scope: true },
    ExportNamedDeclaration(path) {
        replaceNamedLwcExport(path);
    },
    ExportAllDeclaration(path) {
        replaceAllLwcExport(path);
    },
    ExportDefaultDeclaration(path, state) {
        const { node } = path;
        if (!node) return;

        const decl = node.declaration;
        if (decl.type === 'ClassDeclaration') {
            // export default class Foo extends LE {}
            // lwcClassName will be set by the ClassDeclaration visitor; mirror it here
            state.lwcDefaultExportName = decl.id?.name ?? 'DefaultComponentName';
        } else if (decl.type === 'ClassExpression') {
            state.lwcDefaultExportName =
                decl.id?.name ?? state.lwcClassName ?? 'DefaultComponentName';
        } else if (decl.type === 'Identifier') {
            // export default Foo
            state.lwcDefaultExportName = decl.name;
        } else if (decl.type !== 'FunctionDeclaration' && decl.type !== 'FunctionExpression') {
            // export default <expression> — store the path for deferred extraction in Program.leave,
            // where we know whether this is an LWC file (state.isLWC). We don't want to mutate
            // non-LWC modules (e.g. wire adapters with `export default { Adapter }`).
            state.exportDefaultExpressionPath = path;
        }
    },
    ImportDeclaration(path, state) {
        if (!path.node || !path.node.source.value || typeof path.node.source.value !== 'string') {
            return;
        }

        replaceLwcImport(path, state);
        catalogAndReplaceStyleImports(path, state);
        removeDecoratorImport(path);
    },
    ImportExpression(path, state) {
        const { dynamicImports, importManager } = state;
        if (!dynamicImports) {
            // if no `dynamicImports` config, then leave dynamic `import()`s as-is
            return;
        }
        if (dynamicImports.strictSpecifier) {
            if (!is.literal(path.node?.source) || typeof path.node.source.value !== 'string') {
                throw generateError(
                    path.node!,
                    LWCClassErrors.INVALID_DYNAMIC_IMPORT_SOURCE_STRICT,
                    is.literal(path.node?.source) ? String(path.node.source.value) : 'undefined'
                );
            }
        }
        const loader = dynamicImports.loader;
        if (!loader) {
            // if no `loader` defined, then leave dynamic `import()`s as-is
            return;
        }
        const source = path.node!.source!;
        // 1. insert `import { load as __lwcLoad } from '${loader}'` at top of program
        importManager.add({ load: '__lwcLoad' }, loader);
        // 2. replace this `import(source)` with `__lwcLoad(source)`
        const load = b.identifier('__lwcLoad');
        state.trustedLwcIdentifiers.add(load);
        path.replaceWith(b.callExpression(load, [structuredClone(source)]));
    },
    ClassDeclaration: {
        enter(path, state) {
            const { node } = path;
            if (
                node?.superClass &&
                // export default class extends LightningElement {}
                (is.exportDefaultDeclaration(path.parentPath) ||
                    // class Cmp extends LightningElement {}; export default Cmp
                    path.scope
                        ?.getBinding(node.id?.name ?? '')
                        ?.references.some((ref) => is.exportDefaultDeclaration(ref.parent)))
            ) {
                state.isLWC = true;
                state.currentComponent = node;
                if (node.id) {
                    state.lwcClassName = node.id.name;
                } else {
                    // A class declaration can omit a name if and only if it is default-exported.
                    // There is only one default export, so this won't cause collisions.
                    node.id = b.identifier('DefaultComponentName');
                    state.lwcClassName = 'DefaultComponentName';
                }

                // There's no builder for comment nodes :\
                const lwcVersionComment: EsComment = {
                    type: 'Block',
                    value: LWC_VERSION_COMMENT,
                };

                // Add LWC version comment to end of class body
                const { body } = node;
                if (body.trailingComments) {
                    body.trailingComments.push(lwcVersionComment);
                } else {
                    body.trailingComments = [lwcVersionComment];
                }
            }
        },
        leave(path, state) {
            // Indicate that we're no longer traversing an LWC component
            if (state.currentComponent && path.node === state.currentComponent) {
                state.currentComponent = null;
            }
        },
    },
    ClassExpression: {
        enter(path, state) {
            const { node } = path;
            if (
                node?.superClass &&
                is.identifier(node.superClass) &&
                node.superClass.name === state.lightningElementIdentifier
            ) {
                state.isLWC = true;
                state.currentComponent = node;
                // Get the class name from the enclosing variable declarator, if any
                // e.g. `const Component = class extends LightningElement {}`
                if (
                    is.variableDeclarator(path.parentPath?.node) &&
                    is.identifier(path.parentPath.node.id)
                ) {
                    state.lwcClassName = path.parentPath.node.id.name;
                } else if (node.id) {
                    state.lwcClassName = node.id.name;
                }

                // There's no builder for comment nodes :\
                const lwcVersionComment: EsComment = {
                    type: 'Block',
                    value: LWC_VERSION_COMMENT,
                };

                // Add LWC version comment to end of class body
                const { body } = node;
                if (body.trailingComments) {
                    body.trailingComments.push(lwcVersionComment);
                } else {
                    body.trailingComments = [lwcVersionComment];
                }
            }
        },
        leave(path, state) {
            if (state.currentComponent && path.node === state.currentComponent) {
                state.currentComponent = null;
            }
        },
    },
    PropertyDefinition(path, state) {
        // Don't do anything unless we're in a component
        if (!state.currentComponent) {
            return;
        }

        const node = path.node;
        if (!node?.key) {
            // Seems to occur for `@wire() [symbol];` -- not sure why
            throw new Error('Unknown state: property definition has no key');
        }
        if (!isKeyIdentifier(node)) {
            return;
        }

        const { decorators } = node;
        validateUniqueDecorator(decorators);
        if (isApiDecorator(decorators[0])) {
            validateApiProperty(node, state);
            state.publicProperties.set(node.key.name, node);
        } else if (isWireDecorator(decorators[0])) {
            catalogWireAdapters(path, state);
            state.privateProperties.add(node.key.name);
        } else {
            state.privateProperties.add(node.key.name);
        }

        if (
            node.static &&
            node.key.name === 'stylesheets' &&
            is.arrayExpression(node.value) &&
            node.value.elements.every((el) => is.identifier(el))
        ) {
            catalogStaticStylesheets(
                node.value.elements.map((el) => (el as EsIdentifier).name),
                state
            );
        }
    },
    MethodDefinition(path, state) {
        const node = path.node;
        if (!isKeyIdentifier(node)) {
            return;
        }
        // If we mutate any class-methods that are piped through this compiler, then we'll be
        // inadvertently mutating things like Wire adapters.
        if (!state.currentComponent) {
            return;
        }

        const { decorators } = node;
        validateUniqueDecorator(decorators);
        if (isApiDecorator(decorators[0])) {
            validateApiMethod(node, state);
            state.publicProperties.set(node.key.name, node);
        } else if (isWireDecorator(decorators[0])) {
            if (node.computed) {
                // TODO [W-17758410]: implement
                throw new Error('@wire cannot be used on computed properties in SSR context.');
            }
            const isRealMethod = node.kind === 'method';
            // Getters and setters are methods in the AST, but treated as properties by @wire
            // Note that this means that their implementations are ignored!
            if (!isRealMethod) {
                const methodAsProp = b.propertyDefinition(
                    structuredClone(node.key),
                    null,
                    node.computed,
                    node.static
                );
                methodAsProp.decorators = structuredClone(decorators);
                path.replaceWith(methodAsProp);
                // We do not need to call `catalogWireAdapters()` because, by replacing the current
                // node, `traverse()` will visit it again automatically, so we will just call
                // `catalogWireAdapters()` later anyway.
                return;
            } else {
                catalogWireAdapters(path, state);
            }
        }

        switch (node.key.name) {
            case 'constructor':
                // add our own custom arg after any pre-existing constructor args
                node.value.params = [
                    ...structuredClone(node.value.params),
                    b.identifier('propsAvailableAtConstruction'),
                ];
                break;
            case 'connectedCallback':
                state.hasConnectedCallback = true;
                break;
            case 'renderedCallback':
                state.hadRenderedCallback = true;
                path.remove();
                break;
            case 'disconnectedCallback':
                state.hadDisconnectedCallback = true;
                path.remove();
                break;
            case 'errorCallback':
                state.hadErrorCallback = true;
                path.remove();
                break;
        }
    },
    Super(path, state) {
        // If we mutate any super calls that are piped through this compiler, then we'll be
        // inadvertently mutating things like Wire adapters.
        if (!state.currentComponent) {
            return;
        }

        const parentFn = path.getFunctionParent();
        if (
            parentFn &&
            parentFn.parentPath?.node?.type === 'MethodDefinition' &&
            parentFn.parentPath?.node?.kind === 'constructor' &&
            path.parentPath &&
            path.parentPath.node?.type === 'CallExpression'
        ) {
            // add our own custom arg after any pre-existing super() args
            path.parentPath.node.arguments = [
                ...structuredClone(path.parentPath.node.arguments),
                b.identifier('propsAvailableAtConstruction'),
            ];
        }
    },
    Program: {
        leave(path, state) {
            // If the default export is an expression (not class/identifier), extract it into a
            // const so setStaticInternals has a stable identifier to call. Only do this for LWC
            // files — non-LWC modules (e.g. wire adapters) must not be mutated.
            if (state.isLWC && state.exportDefaultExpressionPath) {
                const exportPath = state.exportDefaultExpressionPath;
                const exportedExpr = exportPath.node!.declaration as EsExpression;
                // Each b.identifier() call creates a distinct node object; all must be trusted
                const declId = b.identifier('__lwcDefaultExport');
                const exportId = b.identifier('__lwcDefaultExport');
                state.trustedLwcIdentifiers.add(declId);
                state.trustedLwcIdentifiers.add(exportId);
                // insertBefore must precede replaceWith: replaceWith marks the path as removed
                exportPath.insertBefore([
                    b.variableDeclaration('const', [b.variableDeclarator(declId, exportedExpr)]),
                ]);
                exportPath.replaceWith(b.exportDefaultDeclaration(exportId));
                state.lwcDefaultExportName = '__lwcDefaultExport';
            }

            // After parsing the whole tree, insert needed imports
            const importDeclarations = state.importManager.getImportDeclarations();
            if (importDeclarations.length > 0) {
                path.node?.body.unshift(...importDeclarations);
            }
        },
    },
    Identifier(path, state) {
        const { node } = path;
        if (node?.name.startsWith('__lwc') && !state.trustedLwcIdentifiers.has(node)) {
            throw generateError(node, SsrCompilerErrors.RESERVED_IDENTIFIER_PREFIX);
        }
    },
};

export default function compileJS(
    src: string,
    filename: string,
    tagName: string,
    options: ComponentTransformOptions,
    compilationMode: CompilationMode
) {
    let ast = parseModule(src, {
        module: true,
        next: true,
        loc: true,
        source: filename,
        ranges: true,
    }) as EsProgram;

    const state: ComponentMetaState = {
        isLWC: false,
        currentComponent: null,
        hasConstructor: false,
        hasConnectedCallback: false,
        hadRenderedCallback: false,
        hadDisconnectedCallback: false,
        hadErrorCallback: false,
        lightningElementIdentifier: null,
        lwcClassName: null,
        lwcDefaultExportName: null,
        exportDefaultExpressionPath: null,
        cssExplicitImports: null,
        staticStylesheetIds: null,
        publicProperties: new Map(),
        privateProperties: new Set(),
        wireAdapters: [],
        dynamicImports: options.dynamicImports,
        importManager: new ImportManager(),
        trustedLwcIdentifiers: new WeakSet(),
    };

    traverse(ast, visitors, state);

    if (!state.isLWC) {
        // If an `extends LightningElement` is not detected in the JS, the
        // file in question is likely not an LWC. With this v1 implementation,
        // we'll just return the original source.
        return {
            code: generate(ast, {}),
        };
    }

    addGenerateMarkupFunction(ast, state, tagName, filename, compilationMode);

    if (compilationMode === 'async' || compilationMode === 'sync') {
        ast = transmogrify(ast, compilationMode);
    }

    return {
        code: generate(ast, {
            // The AST generated by meriyah doesn't seem to include comments,
            // so this just preserves the LWC version comment we added
            comments: true,
        }),
    };
}

function isKeyIdentifier<T extends EsPropertyDefinition | EsMethodDefinition>(
    node: T | undefined | null
): node is T & { key: EsIdentifier } {
    return is.identifier(node?.key);
}
