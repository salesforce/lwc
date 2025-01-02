/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    generateConcatenatedTextNodesExpressions,
    generateExpressionFromTextNode,
    isLastConcatenatedNode,
} from '../adjacent-text-nodes';
import type { Statement as EsStatement } from 'estree';
import type { Text as IrText } from '@lwc/template-compiler';
import type { Transformer } from '../types';

export const Text: Transformer<IrText> = function Text(node, cxt): EsStatement[] {
    const valueToYield = generateExpressionFromTextNode(node, cxt);

    if (!isLastConcatenatedNode(cxt)) {
        cxt.bufferedTextNodeValues.push(valueToYield);
        return [];
    }

    return generateConcatenatedTextNodesExpressions(cxt, valueToYield);
};
