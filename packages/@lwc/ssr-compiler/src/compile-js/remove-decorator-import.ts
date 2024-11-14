/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ImportDeclaration } from 'estree';
import { NodePath, builders as b } from 'estree-toolkit';

const decorators = new Set(['api', 'wire', 'track']);

export function removeDecoratorImport(path: NodePath<ImportDeclaration>) {
    if (!path.node || path.node.source.value !== '@lwc/ssr-runtime') {
        return;
    }

    const filteredSpecifiers = path.node.specifiers.filter(
        (specifier) =>
            !(
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.type === 'Identifier' &&
                decorators.has(specifier.imported.name)
            )
    );

    if (filteredSpecifiers.length !== path.node.specifiers.length) {
        path.replaceWith(b.importDeclaration(filteredSpecifiers, b.literal('@lwc/ssr-runtime')));
    }
}
