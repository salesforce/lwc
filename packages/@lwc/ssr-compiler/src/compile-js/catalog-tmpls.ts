/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { NodePath, types as t } from 'estree-toolkit';
import type { ComponentMetaState } from './types';

/**
 * While traversing the component JS, this takes note of any .html files that are
 * explicitly imported.
 */
export function catalogTmplImport(path: NodePath<t.ImportDeclaration>, state: ComponentMetaState) {
    if (!path.node) {
        return;
    }

    const { specifiers, source } = path.node;
    const specifier = specifiers[0];

    if (
        typeof source.value !== 'string' ||
        !source.value.endsWith('.html') ||
        specifiers.length !== 1 ||
        specifier.type !== 'ImportDefaultSpecifier'
    ) {
        return;
    }

    state.tmplExplicitImports = state.tmplExplicitImports ?? new Map();
    state.tmplExplicitImports.set(specifier.local.name, source.value);
}
