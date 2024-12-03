/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { bImportDeclaration } from '../estree/builders';
import type { ImportDeclaration as EsImportDeclaration } from 'estree';
import type { TemplateOpts, TransformerContext } from './types';

export function createNewContext(templateOptions: TemplateOpts): {
    getImports: () => EsImportDeclaration[];
    cxt: TransformerContext;
} {
    /** Map of source to imported name to local name. */
    const importMap = new Map<string, Map<string, string | undefined>>();
    /**
     * Hoist an import declaration to the top of the file. If source is not specified, defaults to
     * `@lwc/ssr-runtime`.
     */
    const _import = (
        imports: string | string[] | Record<string, string | undefined>,
        source = '@lwc/ssr-runtime'
    ): void => {
        let specifiers: Array<[string, string | undefined]>;
        if (typeof imports === 'string') {
            specifiers = [[imports, undefined]];
        } else if (Array.isArray(imports)) {
            specifiers = imports.map((name) => [name, undefined]);
        } else {
            specifiers = Object.entries(imports);
        }

        let specifierMap = importMap.get(source);
        if (specifierMap) {
            for (const [imported, local] of specifiers) {
                specifierMap.set(imported, local);
            }
        } else {
            specifierMap = new Map(specifiers);
            importMap.set(source, specifierMap);
        }
    };

    const getImports = (): EsImportDeclaration[] => {
        return Array.from(importMap, ([source, specifierMap]) => {
            return bImportDeclaration(Object.fromEntries(specifierMap), source);
        });
    };

    const localVarStack: Set<string>[] = [];

    const pushLocalVars = (vars: string[]) => {
        localVarStack.push(new Set(vars));
    };
    const popLocalVars = () => {
        localVarStack.pop();
    };
    const isLocalVar = (varName: string | null | undefined) => {
        if (!varName) {
            return false;
        }
        for (const stackFrame of localVarStack) {
            if (stackFrame.has(varName)) {
                return true;
            }
        }
        return false;
    };

    return {
        getImports,
        cxt: {
            pushLocalVars,
            popLocalVars,
            isLocalVar,
            templateOptions,
            import: _import,
        },
    };
}
