/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generate } from 'astring';
import { traverse, builders as b, is } from 'estree-toolkit';
import { parseModule } from 'meriyah';

import { DecoratorErrors, generateErrorMessage } from '@lwc/errors';
import { transmogrify } from '../transmogrify';
import { ImportManager } from '../imports';
import { replaceLwcImport, replaceNamedLwcExport, replaceAllLwcExport } from './lwc-import';
import { catalogTmplImport } from './catalog-tmpls';
import { catalogStaticStylesheets, catalogAndReplaceStyleImports } from './stylesheets';
import { addGenerateMarkupFunction } from './generate-markup';
import { catalogWireAdapters } from './wire';

import { removeDecoratorImport } from './remove-decorator-import';
import type { ComponentTransformOptions } from '../shared';
import type { Identifier as EsIdentifier, Program as EsProgram, Node as EsNode } from 'estree';
import type { Visitors, ComponentMetaState } from './types';
import type { CompilationMode } from '@lwc/shared';

const visitors: Visitors = {
    $: { scope: true },
    ExportNamedDeclaration(path) {
        replaceNamedLwcExport(path);
    },
    ExportAllDeclaration(path) {
        replaceAllLwcExport(path);
    },
    ImportDeclaration(path, state) {
        if (!path.node || !path.node.source.value || typeof path.node.source.value !== 'string') {
            return;
        }

        replaceLwcImport(path, state);
        catalogTmplImport(path, state);
        catalogAndReplaceStyleImports(path, state);
        removeDecoratorImport(path);
    },
    ImportExpression(path, state) {
        const { experimentalDynamicComponent, importManager } = state;
        if (!experimentalDynamicComponent) {
            // if no `experimentalDynamicComponent` config, then leave dynamic `import()`s as-is
            return;
        }
        if (experimentalDynamicComponent.strictSpecifier) {
            if (!is.literal(path.node?.source) || typeof path.node.source.value !== 'string') {
                // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
                throw new Error('todo - LWCClassErrors.INVALID_DYNAMIC_IMPORT_SOURCE_STRICT');
            }
        }
        const loader = experimentalDynamicComponent.loader;
        if (!loader) {
            // if no `loader` defined, then leave dynamic `import()`s as-is
            return;
        }
        const source = path.node!.source!;
        // 1. insert `import { load as __load } from '${loader}'` at top of program
        importManager.add({ load: '__load' }, loader);
        // 2. replace this import with `__load(${source})`
        path.replaceWith(b.callExpression(b.identifier('__load'), [structuredClone(source)]));
    },
    ClassDeclaration(path, state) {
        const { node } = path;
        if (
            node?.superClass &&
            // export default class extends LightningElement {}
            (is.exportDefaultDeclaration(path.parentPath) ||
                // class Cmp extends LightningElement {}; export default Cmp
                path.scope
                    ?.getBinding(node.id.name)
                    ?.references.some((ref) => is.exportDefaultDeclaration(ref.parent)))
        ) {
            // If it's a default-exported class with a superclass, then it's an LWC component!
            state.isLWC = true;
            if (node.id) {
                state.lwcClassName = node.id.name;
            } else {
                node.id = b.identifier('DefaultComponentName');
                state.lwcClassName = 'DefaultComponentName';
            }
        }
    },
    PropertyDefinition(path, state) {
        const node = path.node;
        if (!is.identifier(node?.key)) {
            return;
        }

        const { decorators } = node;
        const decoratedExpressions = decorators?.map((d) => d.expression) ?? [];
        validateDecorators(decoratedExpressions);
        const decoratedExpression = decoratedExpressions[0];
        if (is.identifier(decoratedExpression) && decoratedExpression.name === 'api') {
            state.publicFields.push(node.key.name);
        } else if (
            is.callExpression(decoratedExpression) &&
            is.identifier(decoratedExpression.callee) &&
            decoratedExpression.callee.name === 'wire'
        ) {
            catalogWireAdapters(path, state);
            state.privateFields.push(node.key.name);
        } else {
            state.privateFields.push(node.key.name);
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
        if (!is.identifier(node?.key)) {
            return;
        }

        // If we mutate any class-methods that are piped through this compiler, then we'll be
        // inadvertently mutating things like Wire adapters.
        if (!state.isLWC) {
            return;
        }

        const { decorators } = node;
        // The real type is a subset of `Expression`, which doesn't work with the `is` validators
        const decoratedExpressions = decorators?.map((d) => d.expression) ?? [];

        validateDecorators(decoratedExpressions);

        const decoratedExpression = decoratedExpressions[0];

        if (
            is.callExpression(decoratedExpression) &&
            is.identifier(decoratedExpression.callee) &&
            decoratedExpression.callee.name === 'wire'
        ) {
            // Getters and setters are methods in the AST, but treated as properties by @wire
            // Note that this means that their implementations are ignored!
            if (node.kind === 'get' || node.kind === 'set') {
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
                node.value.params = [b.identifier('propsAvailableAtConstruction')];
                break;
            case 'connectedCallback':
                state.hasConnectedCallback = true;
                break;
            case 'render':
                state.hasRenderMethod = true;
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
    Super(path, _state) {
        const parentFn = path.getFunctionParent();
        if (
            parentFn &&
            parentFn.parentPath?.node?.type === 'MethodDefinition' &&
            parentFn.parentPath?.node?.kind === 'constructor' &&
            path.parentPath &&
            path.parentPath.node?.type === 'CallExpression'
        ) {
            path.parentPath.node.arguments = [b.identifier('propsAvailableAtConstruction')];
        }
    },
    Program: {
        leave(path, state) {
            // After parsing the whole tree, insert needed imports
            const importDeclarations = state.importManager.getImportDeclarations();
            if (importDeclarations.length > 0) {
                path.node?.body.unshift(...importDeclarations);
            }
        },
    },
};

const isIdentifier = <K extends string>(name: K) =>
    function isIdentifier(expr: EsNode | undefined | null): expr is EsIdentifier & { name: K } {
        return is.identifier(expr) && expr.name === name;
    };

function validateDecorators(decoratedExpressions: EsNode[]) {
    if (decoratedExpressions.length > 1) {
        const isWireAdapter = decoratedExpressions.some((expr) =>
            is.callExpression(expr, { callee: isIdentifier('wire') })
        );

        const isApiDecorator = decoratedExpressions.some(isIdentifier('api'));

        if (isWireAdapter && isApiDecorator) {
            // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
            throw new Error(
                generateErrorMessage(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, ['api'])
            );
        }

        const isTrackDecorator = decoratedExpressions.some(isIdentifier('track'));

        if (isWireAdapter && isTrackDecorator) {
            // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
            throw new Error(
                generateErrorMessage(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, ['track'])
            );
        }
    }
}

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
    }) as EsProgram;

    const state: ComponentMetaState = {
        isLWC: false,
        hasConstructor: false,
        hasConnectedCallback: false,
        hasRenderMethod: false,
        hadRenderedCallback: false,
        hadDisconnectedCallback: false,
        hadErrorCallback: false,
        lightningElementIdentifier: null,
        lwcClassName: null,
        tmplExplicitImports: null,
        cssExplicitImports: null,
        staticStylesheetIds: null,
        publicFields: [],
        privateFields: [],
        wireAdapters: [],
        experimentalDynamicComponent: options.experimentalDynamicComponent,
        importManager: new ImportManager(),
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

    addGenerateMarkupFunction(ast, state, tagName, filename);

    if (compilationMode === 'async' || compilationMode === 'sync') {
        ast = transmogrify(ast, compilationMode);
    }

    return {
        code: generate(ast, {}),
    };
}
