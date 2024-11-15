/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { produce } from 'immer';
import { traverse } from 'estree-toolkit';
import { Visitors } from './transmogrify';
import type { Program as EsProgram } from 'estree';

const visitors: Visitors = {
    $: {
        scope: true,
    },
    ImportDeclaration(path) {
        const { node, scope } = path;
        if (!node || !scope) {
            return;
        }
        if (node.source.type === 'Literal' && node.source.value === '@lwc/ssr-runtime') {
            node.specifiers = node.specifiers.filter(
                (specifier) =>
                    // There shouldn't be any default imports anyway
                    specifier.type === 'ImportSpecifier' &&
                    // If there are references, then the import is used
                    scope.getBinding(specifier.local.name)?.references.length
            );
        }
    },
};

/**
 * Remove any unused imports from `@lwc/ssr-runtime`.
 * This avoids any warnings from Rollup about unused imports, and avoids us needing
 * to manually track what's imported during AST generation.
 * @param compiledComponentAst
 */
export function optimizeImports(compiledComponentAst: EsProgram): EsProgram {
    return produce(compiledComponentAst, (astDraft) => traverse(astDraft, visitors));
}
