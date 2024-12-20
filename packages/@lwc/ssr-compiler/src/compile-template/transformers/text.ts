/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { esTemplateWithYield } from '../../estemplate';
import { expressionIrToEs } from '../expression';
import { isLiteral } from '../shared';

import type { Statement as EsStatement, BlockStatement as EsBlockStatement } from 'estree';
import type { Text as IrText } from '@lwc/template-compiler';
import type { Transformer } from '../types';

const bYieldTextContent = esTemplateWithYield`
{
    const text = massageTextContent(${/* string value */ is.expression});
    yield text === '' ? '\u200D' : htmlEscape(text);
}`<EsBlockStatement>;

export const Text: Transformer<IrText> = function Text(node, cxt): EsStatement[] {
    cxt.import(['htmlEscape', 'massageTextContent']);

    const valueToYield = isLiteral(node.value)
        ? b.literal(node.value.value)
        : expressionIrToEs(node.value, cxt);

    return [bYieldTextContent(valueToYield)];
};
