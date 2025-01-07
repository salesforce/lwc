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
import type { Node as IrNode, Text as IrText, Comment as IrComment } from '@lwc/template-compiler';

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
const isConcatenatedNode = (node: IrNode, cxt: TransformerContext): node is IrText | IrComment => {
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
    const siblings = cxt.siblings!;
    const currentNodeIndex = cxt.currentNodeIndex!;

    const nextSibling = siblings[currentNodeIndex + 1];
    if (!nextSibling) {
        // we are the last sibling
        return true;
    }
    return !isConcatenatedNode(nextSibling, cxt);
};

function generateExpressionFromTextNode(node: IrText, cxt: TransformerContext) {
    return isLiteral(node.value) ? b.literal(node.value.value) : expressionIrToEs(node.value, cxt);
}

export function generateConcatenatedTextNodesExpressions(cxt: TransformerContext) {
    const siblings = cxt.siblings!;
    const currentNodeIndex = cxt.currentNodeIndex!;

    const textNodes = [];

    for (let i = currentNodeIndex; i >= 0; i--) {
        const sibling = siblings[i];
        if (isConcatenatedNode(sibling, cxt)) {
            if (sibling.type === 'Text') {
                textNodes.unshift(sibling);
            }
        } else {
            // if we reach the beginning of the array or a non-Text/Comment node, we are done
            break;
        }
    }

    if (!textNodes.length) {
        // Render nothing. This can occur if we hit a comment in non-preserveComments mode with no adjacent text nodes
        return [];
    }

    cxt.import(['massageTextContent', 'renderTextContent']);

    // Generate a binary expression to concatenate the text together. E.g.:
    //     renderTextContent(
    //         massageTextContent(a) +
    //         massageTextContent(b) +
    //         massageTextContent(c)
    //     )
    const concatenatedExpression = textNodes
        .map(
            (node) => bMassageTextContent(generateExpressionFromTextNode(node, cxt)) as EsExpression
        )
        .reduce((accumulator, expression) => b.binaryExpression('+', accumulator, expression));

    return [bYieldTextContent(concatenatedExpression)];
}
