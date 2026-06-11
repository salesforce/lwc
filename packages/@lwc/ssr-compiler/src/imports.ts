/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { bImportDeclaration } from './estree/builders';
import type { ImportDeclaration } from 'estree';

export class ImportManager {
    #map = new Map</*source*/ string, Map</*imported*/ string, /*local*/ string | undefined>>();

    /** Add an import to a collection of imports, probably for adding to the AST later. */
    add(
        imports: string | string[] | Record<string, string | undefined>,
        source = '@lwc/ssr-runtime'
    ): void {
        let specifiers: Array<[string, string | undefined]>;
        if (typeof imports === 'string') {
            specifiers = [[imports, undefined]];
        } else if (Array.isArray(imports)) {
            specifiers = imports.map((name) => [name, undefined]);
        } else {
            specifiers = Object.entries(imports);
        }

        let specifierMap = this.#map.get(source);
        if (specifierMap) {
            for (const [imported, local] of specifiers) {
                specifierMap.set(imported, local);
            }
        } else {
            specifierMap = new Map(specifiers);
            this.#map.set(source, specifierMap);
        }
    }

    /** Get the collection of imports for adding to the AST, probably soon! */
    getImportDeclarations(): ImportDeclaration[] {
        return Array.from(this.#map, ([source, specifierMap]) => {
            return bImportDeclaration(Object.fromEntries(specifierMap), source);
        });
    }
}
