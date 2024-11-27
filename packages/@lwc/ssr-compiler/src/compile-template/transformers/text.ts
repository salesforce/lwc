/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplateWithYield } from '../../estemplate';
import { expressionIrToEs } from '../expression';

import { bYieldTextContent, isLastConcatenatedNode } from '../adjacent-text-nodes';
import type { Statement as EsStatement } from 'estree';
import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Literal as IrLiteral,
    Text as IrText,
} from '@lwc/template-compiler';
import type { Transformer } from '../types';

const bBufferTextContent = esTemplateWithYield`
    didBufferTextContent = true;
    {
        const value = ${/* string value */ is.expression};
        // Using non strict equality to align with original implementation (ex. undefined == null)
        // See: https://github.com/salesforce/lwc/blob/348130f/packages/%40lwc/engine-core/src/framework/api.ts#L548
        textContentBuffer += value == null ? '' : String(value);
    }
`<EsStatement[]>;

function isLiteral(node: IrLiteral | IrExpression | IrComplexExpression): node is IrLiteral {
    return node.type === 'Literal';
}

export const Text: Transformer<IrText> = function Text(node, cxt): EsStatement[] {
    cxt.import('htmlEscape');

    const isLastInSeries = isLastConcatenatedNode(cxt);

    const valueToYield = isLiteral(node.value)
        ? b.literal(node.value.value)
        : expressionIrToEs(node.value, cxt);

    return [...bBufferTextContent(valueToYield), ...(isLastInSeries ? [bYieldTextContent()] : [])];
};
