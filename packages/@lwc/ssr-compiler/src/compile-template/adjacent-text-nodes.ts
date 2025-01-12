/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { builders as b, is } from 'estree-toolkit';
import { esTemplateWithYield, esTemplate } from '../estemplate';
import { isLiteral } from './shared';
import { expressionIrToEs } from './expression';
import type {
    CallExpression as EsCallExpression,
    Expression as EsExpression,
    ExpressionStatement as EsExpressionStatement,
} from 'estree';
import type { TransformerContext } from './types';
import type { Node as IrNode, Text as IrText, Comment as IrComment } from '@lwc/template-compiler';

const bNormalizeTextContent = esTemplate`
    normalizeTextContent(${/* string value */ is.expression});
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
            // If we reach a non-Text/Comment node, we are done. These should not be concatenated
            // with sibling Text nodes separated by e.g. an Element:
            //     {a}{b}<div></div>{c}{d}
            // In the above, {a} and {b} are concatenated, and {c} and {d} are concatenated,
            // but the `<div>` separates the two groups.
            break;
        }
    }

    if (!textNodes.length) {
        // Render nothing. This can occur if we hit a comment in non-preserveComments mode with no adjacent text nodes
        return [];
    }

    cxt.import(['normalizeTextContent', 'renderTextContent']);

    // Generate a binary expression to concatenate the text together. E.g.:
    //     renderTextContent(
    //         normalizeTextContent(a) +
    //         normalizeTextContent(b) +
    //         normalizeTextContent(c)
    //     )
    const concatenatedExpression = textNodes
        .map(
            (node) =>
                bNormalizeTextContent(generateExpressionFromTextNode(node, cxt)) as EsExpression
        )
        .reduce((accumulator, expression) => b.binaryExpression('+', accumulator, expression));

    return [bYieldTextContent(concatenatedExpression)];
}
