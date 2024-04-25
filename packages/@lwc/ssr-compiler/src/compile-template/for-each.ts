/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { irToEs } from './ir-to-es';
import { optimizeAdjacentYieldStmts } from './shared';

import type { ForEach as IrForEach } from '@lwc/template-compiler';
import type {
    Expression as EsExpression,
    ForOfStatement as EsForOfStatement,
    Identifier as EsIdentifier,
    Statement as EsStatement,
    MemberExpression as EsMemberExpression,
} from 'estree';
import type { Transformer } from './types';

function getRootMemberExpression(node: EsMemberExpression): EsMemberExpression {
    return node.object.type === 'MemberExpression' ? getRootMemberExpression(node.object) : node;
}

function getRootIdentifier(node: EsMemberExpression): EsIdentifier | null {
    const rootMemberExpression = getRootMemberExpression(node);
    return is.identifier(rootMemberExpression?.object) ? rootMemberExpression.object : null;
}

const bForOfYieldFrom = esTemplate<
    EsForOfStatement,
    [EsIdentifier, EsIdentifier, EsExpression, EsStatement[]]
>`
    for (let [${is.identifier}, ${is.identifier}] of Object.entries(${is.expression} ?? {})) {
        ${is.statement};
    }
`;

export const ForEach: Transformer<IrForEach> = function ForEach(node, cxt): EsForOfStatement[] {
    const forItemId = node.item.name;
    const forIndexId = node.index?.name ?? '__unused__';

    cxt.pushLocalVars([forItemId, forIndexId]);
    const forEachStatements = node.children.flatMap((childNode) => {
        return irToEs(childNode, cxt);
    });
    cxt.popLocalVars();

    const expression = node.expression as EsExpression;

    const scopeReferencedId = is.memberExpression(expression)
        ? getRootIdentifier(expression)
        : null;
    const iterable = cxt.isLocalVar(scopeReferencedId?.name)
        ? (node.expression as EsExpression)
        : b.memberExpression(b.identifier('instance'), node.expression as EsExpression);

    return [
        bForOfYieldFrom(
            b.identifier(forIndexId),
            b.identifier(forItemId),
            iterable,
            optimizeAdjacentYieldStmts(forEachStatements)
        ),
    ];
};
