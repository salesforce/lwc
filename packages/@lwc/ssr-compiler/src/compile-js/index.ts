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
import { addGenerateMarkupExport, assignGenerateMarkupToComponent } from './generate-markup';

import type { Identifier as EsIdentifier, Program as EsProgram } from 'estree';
import type { Visitors, ComponentMetaState } from './types';
import type { CompilationMode } from '../shared';

const visitors: Visitors = {
    $: { scope: true },
    ImportDeclaration(path, state) {
        if (!path.node || !path.node.source.value || typeof path.node.source.value !== 'string') {
            return;
        }

        replaceLwcImport(path, state);
        catalogTmplImport(path, state);
        catalogAndReplaceStyleImports(path, state);
    },
    ClassDeclaration(path, state) {
        if (!path.node?.superClass) {
            return;
        }

        if (
            path.node.superClass.type === 'Identifier' &&
            // It is possible to inherit from something that inherits from
            // LightningElement, so the detection here needs additional work.
            path.node.superClass.name === 'LightningElement'
        ) {
            state.isLWC = true;
            if (path.node.id) {
                state.lwcClassName = path.node.id.name;
            } else {
                path.node.id = b.identifier('DefaultComponentName');
                state.lwcClassName = 'DefaultComponentName';
            }
        }
    },
    PropertyDefinition(path, state) {
        if (
            path.node &&
            path.node.static &&
            is.identifier(path.node.key) &&
            path.node.key.name === 'stylesheets' &&
            is.arrayExpression(path.node.value) &&
            path.node.value.elements.every((el) => is.identifier(el))
        ) {
            catalogStaticStylesheets(
                path.node.value.elements.map((el) => (el as EsIdentifier).name),
                state
            );
        }
    },
    MethodDefinition(path, state) {
        if (path.node?.key.type !== 'Identifier') {
            return;
        }
        switch (path.node.key.name) {
            case 'constructor':
                path.node.value.params = [b.identifier('propsAvailableAtConstruction')];
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

export default function compileJS(src: string, filename: string, compilationMode: CompilationMode) {
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

    addGenerateMarkupExport(ast, state, filename);
    assignGenerateMarkupToComponent(ast, state);

    if (compilationMode === 'async' || compilationMode === 'sync') {
        ast = transmogrify(ast, compilationMode);
    }

    return {
        code: generate(ast, {}),
    };
}
