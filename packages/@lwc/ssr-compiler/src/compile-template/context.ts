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
    const getLocalVars = () => localVarStack.flatMap((stackFrameVars) => [...stackFrameVars]);

    const hoistedStatements = {
        module: [] as EsStatement[],
        templateFn: [] as EsStatement[],
    };
    const previouslyHoistedStatementKeysMod = new Set<unknown>();
    const previouslyHoistedStatementKeysTmpl = new Set<unknown>();

    const hoist = {
        module(stmt: EsStatement, optionalDedupeKey?: unknown) {
            if (optionalDedupeKey) {
                if (previouslyHoistedStatementKeysMod.has(optionalDedupeKey)) {
                    return;
                }
                previouslyHoistedStatementKeysMod.add(optionalDedupeKey);
            }
            hoistedStatements.module.push(stmt);
        },
        templateFn(stmt: EsStatement, optionalDedupeKey?: unknown) {
            if (optionalDedupeKey) {
                if (previouslyHoistedStatementKeysTmpl.has(optionalDedupeKey)) {
                    return;
                }
                previouslyHoistedStatementKeysTmpl.add(optionalDedupeKey);
            }
            hoistedStatements.templateFn.push(stmt);
        },
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
            getLocalVars,
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
