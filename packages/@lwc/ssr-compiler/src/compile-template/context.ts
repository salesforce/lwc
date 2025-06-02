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
    const getLocalVars = () => localVarStack.flatMap((varsSet) => Array.from(varsSet));

    const hoistedStatements = {
        module: [] as EsStatement[],
        templateFn: [] as EsStatement[],
    };
    const previouslyHoistedStatementKeysMod = new Set<unknown>();
    const previouslyHoistedStatementKeysTmpl = new Set<unknown>();

    const hoist = {
        // Anything added here will be inserted at the top of the compiled template's
        // JS module.
        module(stmt: EsStatement, optionalDedupeKey?: unknown) {
            if (optionalDedupeKey) {
                if (previouslyHoistedStatementKeysMod.has(optionalDedupeKey)) {
                    return;
                }
                previouslyHoistedStatementKeysMod.add(optionalDedupeKey);
            }
            hoistedStatements.module.push(stmt);
        },
        // Anything added here will be inserted at the top of the JavaScript function
        // corresponding to the template (typically named `__lwcTmpl`).
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

    // At present, we only track shadow-slotted content. This is because the functions
    // corresponding to shadow-slotted content are deduped and hoisted to the top of
    // the template function, whereas light-dom-slotted content is inlined. It may be
    // desirable to also track light-dom-slotted content at some future point in time.
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
