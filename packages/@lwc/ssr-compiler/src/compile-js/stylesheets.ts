/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplate } from '../estemplate';

import type { NodePath } from 'estree-toolkit';
import type { Program, ImportDeclaration } from 'estree';
import type { ComponentMetaState } from './types';

const bDefaultStyleImport = esTemplate<ImportDeclaration>`
    import defaultStylesheets from '${is.literal}';
`;

export function catalogStyleImport(path: NodePath<ImportDeclaration>, state: ComponentMetaState) {
    const specifier = path.node!.specifiers[0];

    if (
        typeof path.node!.source.value !== 'string' ||
        !path.node!.source.value!.endsWith('.css') ||
        path.node!.specifiers.length !== 1 ||
        specifier.type !== 'ImportDefaultSpecifier'
    ) {
        return;
    }

    state.cssExplicitImports = state.cssExplicitImports ?? new Map();
    state.cssExplicitImports.set(specifier.local.name, path.node!.source.value);
}

const componentNamePattern = /[/\\](?<componentName>[a-z_-]+)[/\\]\k<componentName>\.[tj]s$/i;

/**
 * This adds implicit style imports to the compiled component artifact.
 */
export function addStylesheetImports(ast: Program, state: ComponentMetaState, filepath: string) {
    const componentName = componentNamePattern.exec(filepath)?.groups?.componentName;
    if (!componentName) {
        throw new Error(`Could not determine component name from file path: ${filepath}`);
    }

    if (state.cssExplicitImports || state.staticStylesheetIds) {
        throw new Error(
            `Unimplemented static stylesheets, but found:\n${[...state.cssExplicitImports!].join(
                '  \n'
            )}`
        );
    }

    ast.body.unshift(bDefaultStyleImport(b.literal(`./${componentName}.css`)));
}

export function catalogStaticStylesheets(ids: string[], state: ComponentMetaState) {
    state.staticStylesheetIds = state.staticStylesheetIds ?? new Set();
    for (const id of ids) {
        state.staticStylesheetIds.add(id);
    }
}
