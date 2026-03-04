/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { Program, ImportDeclaration } from '@swc/types';

/**
 * Adds `?scoped=true` to any import specifiers ending with `.scoped.css`.
 * This signals that the stylesheet should be treated as "scoped".
 */
export function scopeCssImports(program: Program): void {
    const body = program.type === 'Module' ? program.body : (program as any).body;
    for (const node of body) {
        if (node.type === 'ImportDeclaration') {
            const decl = node as ImportDeclaration;
            if (decl.source.value.endsWith('.scoped.css')) {
                decl.source.value = decl.source.value + '?scoped=true';
                if (decl.source.raw) {
                    decl.source.raw = JSON.stringify(decl.source.value);
                }
            }
        }
    }
}
