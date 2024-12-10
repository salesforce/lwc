/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';

import type { ImportDeclaration, ExportNamedDeclaration } from 'estree';
import type { NodePath } from 'estree-toolkit';
import type { ComponentMetaState } from './types';

/**
 * This accomplishes two things:
 *
 *  1. it replaces "lwc" with "@lwc/ssr-runtime" in an import specifier
 *  2. it makes note of the local var name associated with the `LightningElement` import
 */
export function replaceLwcImport(path: NodePath<ImportDeclaration>, state: ComponentMetaState) {
    if (!path.node || path.node.source.value !== 'lwc') {
        return;
    }

    for (const specifier of path.node.specifiers) {
        if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === 'LightningElement'
        ) {
            state.lightningElementIdentifier = specifier.local.name;
            break;
        }
    }

    path.replaceWith(b.importDeclaration(path.node.specifiers, b.literal('@lwc/ssr-runtime')));
}

/**
 * This handles lwc barrel exports by replacing "lwc" with "@lwc/ssr-runtime"
 */
export function replaceNamedLwcImport(path: NodePath<ExportNamedDeclaration>) {
    if (!path.node || path.node.source?.value !== 'lwc') {
        return;
    }

    path.replaceWith(
        b.exportNamedDeclaration(
            path.node.declaration,
            path.node.specifiers,
            b.literal('@lwc/ssr-runtime')
        )
    );
}
