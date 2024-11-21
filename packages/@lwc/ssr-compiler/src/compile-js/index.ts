/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generate } from 'astring';
import { traverse, builders as b, is } from 'estree-toolkit';
import { parseModule } from 'meriyah';

import { transmogrify } from '../transmogrify';
import { replaceLwcImport } from './lwc-import';
import { catalogTmplImport } from './catalog-tmpls';
import { catalogStaticStylesheets, catalogAndReplaceStyleImports } from './stylesheets';
import { addGenerateMarkupExport } from './generate-markup';
import { catalogWireAdapters } from './wire';

import { removeDecoratorImport } from './remove-decorator-import';
import type { Identifier as EsIdentifier, Program as EsProgram, Expression } from 'estree';
import type { Visitors, ComponentMetaState } from './types';
import type { CompilationMode } from '../shared';
import type {
    PropertyDefinition as DecoratatedPropertyDefinition,
    MethodDefinition as DecoratatedMethodDefinition,
} from 'meriyah/dist/src/estree';

const visitors: Visitors = {
    $: { scope: true },
    ImportDeclaration(path, state) {
        if (!path.node || !path.node.source.value || typeof path.node.source.value !== 'string') {
            return;
        }

        replaceLwcImport(path, state);
        catalogTmplImport(path, state);
        catalogAndReplaceStyleImports(path, state);
        removeDecoratorImport(path);
    },
    ImportExpression(path) {
        return path.replaceWith(
            b.callExpression(
                b.memberExpression(b.identifier('Promise'), b.identifier('resolve')),
                []
            )
        );
    },
    ClassDeclaration(path, state) {
        const { node } = path;
        if (!node?.superClass) {
            return;
        }
        // Assume everything with a superclass is an LWC component
        state.isLWC = true;
        if (node.id) {
            state.lwcClassName = node.id.name;
        } else {
            node.id = b.identifier('DefaultComponentName');
            state.lwcClassName = 'DefaultComponentName';
        }
    },
    PropertyDefinition(path, state) {
        const node = path.node;
        if (!is.identifier(node?.key)) {
            return;
        }

        const decorators = (node as DecoratatedPropertyDefinition).decorators;
        const decoratedExpression = decorators?.[0]?.expression as Expression;
        if (is.identifier(decoratedExpression) && decoratedExpression.name === 'api') {
            state.publicFields.push(node.key.name);
        } else if (
            is.callExpression(decoratedExpression) &&
            is.identifier(decoratedExpression.callee) &&
            decoratedExpression.callee.name === 'wire'
        ) {
            catalogWireAdapters(state, node);
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

        const decorators = (node as DecoratatedMethodDefinition).decorators;
        const decoratedExpression = decorators?.[0]?.expression as Expression;
        if (
            is.callExpression(decoratedExpression) &&
            is.identifier(decoratedExpression.callee) &&
            decoratedExpression.callee.name === 'wire'
        ) {
            catalogWireAdapters(state, node);
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
};

export default function compileJS(
    src: string,
    filename: string,
    tagName: string,
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

    addGenerateMarkupExport(ast, state, tagName, filename);

    if (compilationMode === 'async' || compilationMode === 'sync') {
        ast = transmogrify(ast, compilationMode);
    }

    return {
        code: generate(ast, {}),
    };
}
