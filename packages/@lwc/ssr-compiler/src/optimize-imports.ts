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
            node.specifiers = node.specifiers.filter((specifier) => {
                if (specifier.type === 'ImportSpecifier') {
                    const binding = scope.getBinding(specifier.local.name);
                    // if there are references, then the import is used
                    return binding?.references.length;
                }
                // unused
                return false;
            });
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
