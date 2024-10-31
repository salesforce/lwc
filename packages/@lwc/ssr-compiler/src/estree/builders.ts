/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';

import type { ImportDeclaration } from 'estree';

/** Creates a default import statement, e.g. `import pkg from "pkg"` */
export const bImportDefaultDeclaration = (name: string, source: string): ImportDeclaration =>
    b.importDeclaration([b.importDefaultSpecifier(b.identifier(name))], b.literal(source));

/**
 * Creates an import statement, e.g. `import { foo, bar as $bar$ } from "pkg"`.
 * Does not support default or namespace imports (`import pkg` or `import * as pkg`).
 * @param imports names to be imported; values can be a string (plain import) or object (aliased)
 * @param source source location to import from; defaults to @lwc/ssr-runtime
 */
export const bImportDeclaration = (
    imports: (string | Record<string, string>)[],
    source = '@lwc/ssr-runtime'
): ImportDeclaration => {
    const specifiers = imports
        .flatMap((imp) => (typeof imp === 'string' ? ([[imp, imp]] as const) : Object.entries(imp)))
        .map(([imported, local]) => b.importSpecifier(b.identifier(imported), b.identifier(local)));
    return b.importDeclaration(specifiers, b.literal(source));
};
