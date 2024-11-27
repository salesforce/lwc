/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplateWithYield } from '../../estemplate';
import { expressionIrToEs } from '../expression';

import { shouldFlushTextContent } from '../shared';
import type {
    Expression as EsExpression,
    Statement as EsStatement,
} from 'estree';
import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Literal as IrLiteral,
    Text as IrText,
} from '@lwc/template-compiler';
import type { Transformer } from '../types';

const bYield = (expr: EsExpression) => b.expressionStatement(b.yieldExpression(expr));

const bYieldTextContent = esTemplateWithYield`
    enqueueTextContent(${/* string value */ is.expression});
    if (${/* should flush */ is.literal}) {
        yield flushTextContent();
    }
`<EsStatement>;

function isLiteral(node: IrLiteral | IrExpression | IrComplexExpression): node is IrLiteral {
    return node.type === 'Literal';
}

export const Text: Transformer<IrText> = function Text(node, cxt): EsStatement[] {
    if (isLiteral(node.value)) {
        return [bYield(b.literal(node.value.value))];
    }

    const valueToYield = expressionIrToEs(node.value, cxt);

    cxt.import(['enqueueTextContent', 'flushTextContent']);
    return [bYieldTextContent(valueToYield, b.literal(shouldFlushTextContent(cxt)))];
};
