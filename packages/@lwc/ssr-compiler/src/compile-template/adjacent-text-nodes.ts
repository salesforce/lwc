/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { esTemplateWithYield } from '../estemplate';
import type { BlockStatement as EsBlockStatement } from 'estree';
import type { TransformerContext } from './types';
import type { Node as IrNode } from '@lwc/template-compiler';

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

export const bYieldTextContent = esTemplateWithYield`
    if (didBufferTextContent) {
        // We are at the end of a series of text nodes - flush to a concatenated string
        // We only render the ZWJ if there were actually any dynamic text nodes rendered
        // The ZWJ is just so hydration can compare the SSR'd dynamic text content against
        // the CSR'd text content.
        yield textContentBuffer === '' ? '\u200D' : htmlEscape(textContentBuffer);
        // Reset
        textContentBuffer = '';
        didBufferTextContent = false;
    }
`<EsBlockStatement>;
