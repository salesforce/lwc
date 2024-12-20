/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { builders as b } from 'estree-toolkit/dist/builders';
import { is } from 'estree-toolkit';
import { esTemplate, esTemplateWithYield } from '../estemplate';
import { isLiteral } from './shared';
import { expressionIrToEs } from './expression';
import type {
    CallExpression as EsCallExpression,
    Expression as EsExpression,
    ExpressionStatement as EsExpressionStatement,
} from 'estree';
import type { TransformerContext } from './types';
import type { Node as IrNode, Text as IrText } from '@lwc/template-compiler';

const bMassageTextContent = esTemplate`
    massageTextContent(${/* string value */ is.expression});
`<EsCallExpression>;

const bYieldTextContent = esTemplateWithYield`
    yield renderTextContent(${/* text concatenation, possibly as binary expression */ is.expression});
`<EsExpressionStatement>;

/**
 * True if this is one of a series of text content nodes and/or comment node that are adjacent to one another as
 * siblings. (Comment nodes are ignored when preserve-comments is turned off.) This allows for adjacent text
 * node concatenation.
 */
const isConcatenatedNode = (node: IrNode, cxt: TransformerContext) => {
    switch (node.type) {
        case 'Text':
            return true;
        case 'Comment':
            return !cxt.templateOptions.preserveComments;
        default:
            return false;
    }
};

export const isLastConcatenatedNode = (cxt: TransformerContext) => {
    const { nextSibling } = cxt;
    if (!nextSibling) {
        // we are the last sibling
        return true;
    }
    return !isConcatenatedNode(nextSibling, cxt);
};

export function generateConcatenatedTextNodesExpressions(
    cxt: TransformerContext,
    lastValue?: EsExpression
) {
    const values = [...cxt.bufferedTextNodeValues];
    if (lastValue) {
        values.push(lastValue);
    }

    if (!values.length) {
        // Render nothing. This can occur if we hit a comment in non-preserveComments mode with no adjacent text nodes
        return [];
    }

    cxt.import(['massageTextContent', 'renderTextContent']);

    const expressions: EsExpression[] = values.map((_) => bMassageTextContent(_));

    // Generate a binary expression to concatenate the text together. E.g.:
    //     renderTextContent(
    //         massageTextContent(a) +
    //         massageTextContent(b) +
    //         massageTextContent(c)
    //     )
    const concatenatedExpression = expressions.reduce((accumulator, expression) => {
        return b.binaryExpression('+', accumulator, expression);
    });

    cxt.bufferedTextNodeValues.length = 0; // reset

    return [bYieldTextContent(concatenatedExpression)];
}

export function generateExpressionFromTextNode(node: IrText, cxt: TransformerContext) {
    return isLiteral(node.value) ? b.literal(node.value.value) : expressionIrToEs(node.value, cxt);
}
