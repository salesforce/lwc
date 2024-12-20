/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ImportManager } from '../imports';
import type { ImportDeclaration as EsImportDeclaration } from 'estree';
import type { TemplateOpts, TransformerContext } from './types';

export function createNewContext(templateOptions: TemplateOpts): {
    getImports: () => EsImportDeclaration[];
    cxt: TransformerContext;
} {
    const importManager = new ImportManager();
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
        getImports: () => importManager.getImportDeclarations(),
        cxt: {
            pushLocalVars,
            popLocalVars,
            isLocalVar,
            templateOptions,
            import: importManager.add.bind(importManager),
            bufferedTextNodeValues: [],
        },
    };
}
