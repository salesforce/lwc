/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplate } from '../../estemplate';
import { irChildrenToEs } from '../ir-to-es';
import { getScopedExpression, optimizeAdjacentYieldStmts } from '../shared';

import type { ForEach as IrForEach } from '@lwc/template-compiler';
import type { Expression as EsExpression, ForOfStatement as EsForOfStatement } from 'estree';
import type { Transformer } from '../types';

const bForOfYieldFrom = esTemplate`
    for (let [${is.identifier}, ${is.identifier}] of Object.entries(${is.expression} ?? {})) {
        ${[is.statement]};
    }
`<EsForOfStatement>;

export const ForEach: Transformer<IrForEach> = function ForEach(node, cxt): EsForOfStatement[] {
    const forItemId = node.item.name;
    const forIndexId = node.index?.name ?? '__unused__';

    cxt.pushLocalVars([forItemId, forIndexId]);
    const forEachStatements = irChildrenToEs(node.children, cxt);
    cxt.popLocalVars();

    const expression = node.expression as EsExpression;
    const iterable = getScopedExpression(expression, cxt);

    return [
        bForOfYieldFrom(
            b.identifier(forIndexId),
            b.identifier(forItemId),
            iterable,
            optimizeAdjacentYieldStmts(forEachStatements)
        ),
    ];
};
