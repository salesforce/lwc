/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';
import { irChildrenToEs } from '../ir-to-es';
import { expressionIrToEs } from '../expression';
import { optimizeAdjacentYieldStmts } from '../shared';

import type {
    If as IrIf,
} from '@lwc/template-compiler';
import type { Transformer } from '../types';

export const LegacyIf: Transformer<IrIf> = function If(node, cxt) {
    const { modifier: trueOrFalseAsStr, condition, children } = node;

    const trueOrFalse = trueOrFalseAsStr === 'true';
    // FIXME: Does engine-server actually do triple-equals here?
    const comparison = b.binaryExpression(
        '===',
        b.literal(trueOrFalse),
        expressionIrToEs(condition, cxt)
    );

    const childStatements = irChildrenToEs(children, cxt);
    const block = b.blockStatement(optimizeAdjacentYieldStmts(childStatements));

    return [
        b.ifStatement(comparison, block)
    ];
};
