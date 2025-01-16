/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, type types as es } from 'estree-toolkit';

/**
 * Creates an import statement, e.g. `import { foo, bar as $bar$ } from "pkg"`
 * @param imports names to be imported; values can be a string (plain import) or object (aliased)
 * @param source source location to import from; defaults to @lwc/ssr-runtime
 */
export const bImportDeclaration = (
    imports: string | string[] | Record<string, string | undefined>,
    source = '@lwc/ssr-runtime'
): es.ImportDeclaration => {
    let parsed: Array<[string, string | undefined]>;
    if (typeof imports === 'string') {
        parsed = [[imports, undefined]];
    } else if (Array.isArray(imports)) {
        parsed = imports.map((imp) => [imp, undefined]);
    } else {
        parsed = Object.entries(imports);
    }
    const specifiers = parsed.map(([imported, local]) => {
        if (imported === 'default') {
            return b.importDefaultSpecifier(b.identifier(local!));
        } else if (imported === '*') {
            return b.importNamespaceSpecifier(b.identifier(local!));
        } else if (local) {
            return b.importSpecifier(b.identifier(imported), b.identifier(local));
        } else {
            return b.importSpecifier(b.identifier(imported));
        }
    });
    return b.importDeclaration(specifiers, b.literal(source));
};
