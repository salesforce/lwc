/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Node as IrNode } from '@lwc/template-compiler';
import type { ModuleDeclaration as EsModuleDeclaration, Statement as EsStatement } from 'estree';

export type Transformer<T extends IrNode = IrNode> = (
    node: T,
    cxt: TransformerContext
) => EsStatement[];

export interface TransformerContext {
    hoist: (stmt: EsStatement | EsModuleDeclaration, dedupeKey: string) => void;
    pushLocalVars: (vars: string[]) => void;
    popLocalVars: () => void;
    isLocalVar: (varName: string | null | undefined) => boolean;
    getUniqueVar: () => string;
    templateOptions: TemplateOpts;
    prevSibling?: IrNode;
    nextSibling?: IrNode;
}

export interface TemplateOpts {
    preserveComments: boolean;
}
