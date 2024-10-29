/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplate } from '../estemplate';

import type { NodePath } from 'estree-toolkit';
import type { ImportDeclaration } from 'estree';
import type { ComponentMetaState } from './types';

const bDefaultStyleImport = esTemplate`
    import defaultStylesheets from '${is.literal}';
`<ImportDeclaration>;

const bDefaultScopedStyleImport = esTemplate`
    import defaultScopedStylesheets from '${is.literal}';
`<ImportDeclaration>;

export function catalogAndReplaceStyleImports(
    path: NodePath<ImportDeclaration>,
    state: ComponentMetaState
) {
    const specifier = path.node!.specifiers[0];

    if (
        typeof path.node!.source.value !== 'string' ||
        !path.node!.source.value!.endsWith('.css') ||
        path.node!.specifiers.length !== 1 ||
        specifier.type !== 'ImportDefaultSpecifier'
    ) {
        return;
    }

    // Any file ending in `*.scoped.css` which is directly imported into a Component `*.js` file (and assumed
    // to be used for `static stylesheets`) is assumed to be scoped, so needs to be marked as such with a query param.
    // Outside of SSR, this is done by `@lwc/babel-plugin-component`, so we need to emulate its behavior. The goal here
    // is for `@lwc/template-compiler` to know to add `stylesheet.$scoped$ = true` to its compiled output, which it
    // detects using the query param.
    if (path.node?.source.value.endsWith('.scoped.css')) {
        path.replaceWith(
            b.importDeclaration(
                path.node.specifiers,
                b.literal(path.node.source.value + '?scoped=true')
            )
        );
    }

    state.cssExplicitImports = state.cssExplicitImports ?? new Map();
    state.cssExplicitImports.set(specifier.local.name, path.node!.source.value);
}

/**
 * This adds implicit style imports to the compiled component artifact.
 */
export function getStylesheetImports(filepath: string) {
    const moduleName = /(?<moduleName>[^/]+)\.html$/.exec(filepath)?.groups?.moduleName;
    if (!moduleName) {
        throw new Error(`Could not determine module name from file path: ${filepath}`);
    }

    return [
        bDefaultStyleImport(b.literal(`./${moduleName}.css`)),
        bDefaultScopedStyleImport(b.literal(`./${moduleName}.scoped.css?scoped=true`)),
    ];
}

export function catalogStaticStylesheets(ids: string[], state: ComponentMetaState) {
    state.staticStylesheetIds = state.staticStylesheetIds ?? new Set();
    for (const id of ids) {
        state.staticStylesheetIds.add(id);
    }
}
