/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';

import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Identifier as IrIdentifier,
    MemberExpression as IrMemberExpression,
} from '@lwc/template-compiler';
import type {
    Identifier as EsIdentifier,
    Expression as EsExpression,
    MemberExpression as EsMemberExpression,
} from 'estree';
import type { TransformerContext } from './types';

function getRootMemberExpression(node: IrMemberExpression): IrMemberExpression {
    return node.object.type === 'MemberExpression' ? getRootMemberExpression(node.object) : node;
}

export function expressionIrToEs(
    node: IrExpression | IrComplexExpression,
    cxt: TransformerContext
): EsExpression {
    if (node.type === 'Identifier') {
        const isLocalVar = cxt.isLocalVar((node as IrIdentifier).name);
        return isLocalVar
            ? (node as EsIdentifier)
            : b.memberExpression(b.identifier('instance'), node as EsIdentifier);
    } else if (node.type === 'MemberExpression') {
        const nodeClone = structuredClone(node);
        const rootMemberExpr = getRootMemberExpression(nodeClone as IrMemberExpression);
        if (!cxt.isLocalVar((rootMemberExpr.object as IrIdentifier).name)) {
            rootMemberExpr.object = b.memberExpression(
                b.identifier('instance'),
                rootMemberExpr.object as EsIdentifier
            ) as unknown as IrMemberExpression;
        }
        return nodeClone as unknown as EsMemberExpression;
    }
    throw new Error(`Unimplemented expression: ${node.type}`);
}
