/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generate } from 'astring';
import { traverse, builders as b, is } from 'estree-toolkit';
import { parseModule } from 'meriyah';

import { DecoratorErrors } from '@lwc/errors';
import { transmogrify } from '../transmogrify';
import { ImportManager } from '../imports';
import { replaceLwcImport, replaceNamedLwcExport, replaceAllLwcExport } from './lwc-import';
import { catalogTmplImport } from './catalog-tmpls';
import { catalogStaticStylesheets, catalogAndReplaceStyleImports } from './stylesheets';
import { addGenerateMarkupFunction } from './generate-markup';
import { catalogWireAdapters, isWireDecorator } from './wire';
import validateUniqueness, {
    isApiDecorator,
    validatePropertyName,
    validatePropertyValue,
    validateUniqueProperty,
} from './api';
import { isTrackDecorator } from './track';

import { removeDecoratorImport } from './remove-decorator-import';
import { generateError } from './errors';

import { type Visitors, type ComponentMetaState, isKeyIdentifier, isMethodKind } from './types';
import type { ComponentTransformOptions } from '../shared';
import type {
    Identifier as EsIdentifier,
    Program as EsProgram,
    Decorator as EsDecorator,
} from 'estree';
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
        if (!isKeyIdentifier(node)) {
            return;
        }

        const { decorators } = node;
        validateUniqueDecorator(decorators);
        if (isApiDecorator(decorators[0])) {
            validateUniqueProperty(node, state);
            validatePropertyName(node);
            validatePropertyValue(node);
            state.publicFields.set(node.key.name, node);
        } else if (isWireDecorator(decorators[0])) {
            catalogWireAdapters(path, state);
            state.privateFields.add(node.key.name);
        } else {
            state.privateFields.add(node.key.name);
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
        if (!state.isLWC) {
            return;
        }

        const { decorators } = node;
        validateUniqueDecorator(decorators);
        if (isWireDecorator(decorators[0])) {
            // Getters and setters are methods in the AST, but treated as properties by @wire
            // Note that this means that their implementations are ignored!
            if (isMethodKind(node, ['get', 'set'])) {
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
        } else if (isApiDecorator(decorators[0])) {
            validateUniqueness(node, state);
            validatePropertyName(node);
            state.publicFields.set(node.key.name, node);
        }

        switch (node.key.name) {
            case 'constructor':
                node.value.params = [b.identifier('propsAvailableAtConstruction')];
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

function validateUniqueDecorator(decorators: EsDecorator[]) {
    if (decorators.length < 2) {
        return;
    }

    const hasWire = decorators.some(isWireDecorator);
    const hasApi = decorators.some(isApiDecorator);
    const hasTrack = decorators.some(isTrackDecorator);

    if (hasWire) {
        if (hasApi) {
            throw generateError(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, 'api');
        }

        if (hasTrack) {
            throw generateError(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, 'track');
        }
    }

    if (hasApi && hasTrack) {
        throw generateError(DecoratorErrors.API_AND_TRACK_DECORATOR_CONFLICT);
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
        hadRenderedCallback: false,
        hadDisconnectedCallback: false,
        hadErrorCallback: false,
        lightningElementIdentifier: null,
        lwcClassName: null,
        tmplExplicitImports: null,
        cssExplicitImports: null,
        staticStylesheetIds: null,
        publicFields: new Map(),
        privateFields: new Set(),
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
