/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ImportManager } from '../imports';
import type { ImportDeclaration as EsImportDeclaration, Statement as EsStatement } from 'estree';
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

    const hoistedStatements: EsStatement[] = [];
    const previouslyHoistedStatementKeys = new Set<unknown>();
    const hoist = (stmt: EsStatement, optionalDedupeKey?: unknown) => {
        if (optionalDedupeKey) {
            if (previouslyHoistedStatementKeys.has(optionalDedupeKey)) {
                return;
            }
            previouslyHoistedStatementKeys.add(optionalDedupeKey);
        }
        hoistedStatements.push(stmt);
    };

    const shadowSlotToFnName = new Map<string, string>();
    let fnNameUniqueId = 0;

    const slots = {
        shadow: {
            isDuplicate(uniqueNodeId: string) {
                return shadowSlotToFnName.has(uniqueNodeId);
            },
            register(uniqueNodeId: string, kebabCmpName: string) {
                if (slots.shadow.isDuplicate(uniqueNodeId)) {
                    return shadowSlotToFnName.get(uniqueNodeId)!;
                }
                const shadowSlotContentFnName = `__lwcGenerateShadowSlottedContent_${kebabCmpName}_${fnNameUniqueId++}`;
                shadowSlotToFnName.set(uniqueNodeId, shadowSlotContentFnName);
                return shadowSlotContentFnName;
            },
            getFnName(uniqueNodeId: string) {
                return shadowSlotToFnName.get(uniqueNodeId) ?? null;
            },
        },
    };

    return {
        getImports: () => importManager.getImportDeclarations(),
        cxt: {
            pushLocalVars,
            popLocalVars,
            isLocalVar,
            templateOptions,
            hoist,
            hoistedStatements,
            slots,
            import: importManager.add.bind(importManager),
            siblings: undefined,
            currentNodeIndex: undefined,
        },
    };
}
