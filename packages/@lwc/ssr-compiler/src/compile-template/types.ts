/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Node as IrNode } from '@lwc/template-compiler';
import type { Statement as EsStatement } from 'estree';

export type Transformer<T extends IrNode = IrNode> = (
    node: T,
    cxt: TransformerContext
) => EsStatement[];

export interface SlotMetadataContext {
    shadow: {
        isDuplicate: (uniqueNodeId: string) => boolean;
        register: (uniqueNodeId: string, kebabCmpName: string) => string;
        getFnName: (uniqueNodeId: string) => string | null;
    };
}

export interface TransformerContext {
    pushLocalVars: (vars: string[]) => void;
    popLocalVars: () => void;
    isLocalVar: (varName: string | null | undefined) => boolean;
    templateOptions: TemplateOpts;
    siblings: IrNode[] | undefined;
    currentNodeIndex: number | undefined;
    isSlotted?: boolean;
    hoistedStatements: {
        module: EsStatement[];
        templateFn: EsStatement[];
    };
    hoist: {
        module: (stmt: EsStatement, optionalDedupeKey?: unknown) => void;
        templateFn: (stmt: EsStatement, optionalDedupeKey?: unknown) => void;
    };
    slots: SlotMetadataContext;
    import: (
        imports: string | string[] | Record<string, string | undefined>,
        source?: string
    ) => void;
}

export interface TemplateOpts {
    preserveComments: boolean;
    experimentalComplexExpressions: boolean;
}
