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
    ChildNode as IrChildNode,
    ElseifBlock as IrElseifBlock,
    IfBlock as IrIfBlock,
} from '@lwc/template-compiler';
import type { BlockStatement as EsBlockStatement, IfStatement as EsIfStatement } from 'estree';
import type { Transformer, TransformerContext } from '../types';

// lwc:if/lwc:elseif/lwc:else use bookend comments due to VFragment vdom node using them
// The bookends should surround the entire if/elseif/else series
// Note: these should only be rendered if _something_ is rendered by a series of if/elseif/else's
function bYieldBookendComment() {
    return b.expressionStatement(b.yieldExpression(b.literal(`<!---->`)));
}

function bBlockStatement(childNodes: IrChildNode[], cxt: TransformerContext): EsBlockStatement {
    const childStatements = irChildrenToEs(childNodes, cxt);

    // Due to `flattenFragmentsInChildren`, we have to remove bookends for all _top-level_ slotted
    // content. This applies to both light DOM and shadow DOM slots, although light DOM slots have
    // the additional wrinkle that they themselves are VFragments with their own bookends.
    // https://github.com/salesforce/lwc/blob/a33b390/packages/%40lwc/engine-core/src/framework/rendering.ts#L718-L753
    const statements = cxt.isSlotted
        ? childStatements
        : [bYieldBookendComment(), ...childStatements, bYieldBookendComment()];
    return b.blockStatement(optimizeAdjacentYieldStmts(statements));
}

function bIfStatement(
    ifElseIfNode: IrIfBlock | IrElseifBlock,
    cxt: TransformerContext
): EsIfStatement {
    const { children, condition, else: elseNode } = ifElseIfNode;

    let elseBlock = null;
    if (elseNode) {
        if (elseNode.type === 'ElseBlock') {
            elseBlock = bBlockStatement(elseNode.children, cxt);
        } else {
            elseBlock = bIfStatement(elseNode, cxt);
        }
    }

    return b.ifStatement(
        expressionIrToEs(condition, cxt),
        bBlockStatement(children, cxt),
        elseBlock
    );
}

export const IfBlock: Transformer<IrIfBlock | IrElseifBlock> = function IfBlock(node, cxt) {
    return [bIfStatement(node, cxt)];
};
