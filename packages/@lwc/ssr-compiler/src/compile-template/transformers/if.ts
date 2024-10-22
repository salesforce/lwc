/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';
import { irToEs } from '../ir-to-es';
import { expressionIrToEs } from '../expression';
import { optimizeAdjacentYieldStmts } from '../shared';

import type {
    ChildNode as IrChildNode,
    ElseifBlock as IrElseifBlock,
    If as IrIf,
    IfBlock as IrIfBlock,
} from '@lwc/template-compiler';
import type { BlockStatement as EsBlockStatement, IfStatement as EsIfStatement } from 'estree';
import type { Transformer, TransformerContext } from '../types';

function bYieldComment(text = '') {
    return b.expressionStatement(b.yieldExpression(b.literal(`<!--${text}-->`)));
}

function bBlockStatement(
    childNodes: IrChildNode[],
    cxt: TransformerContext,
    insertComments: boolean
): EsBlockStatement {
    let statements = childNodes.flatMap((childNode) => irToEs(childNode, cxt));
    if (insertComments) statements = [bYieldComment(), ...statements, bYieldComment()];
    return b.blockStatement(optimizeAdjacentYieldStmts(statements));
}

export const If: Transformer<IrIf> = function If(node, cxt) {
    const { modifier: trueOrFalseAsStr, condition, children } = node;

    const trueOrFalse = trueOrFalseAsStr === 'true';
    const comparison = b.binaryExpression(
        '===',
        b.literal(trueOrFalse),
        expressionIrToEs(condition, cxt)
    );

    return [b.ifStatement(comparison, bBlockStatement(children, cxt, false))];
};

function bIfStatement(
    ifElseIfNode: IrIfBlock | IrElseifBlock,
    cxt: TransformerContext
): EsIfStatement {
    const { children, condition, else: elseNode } = ifElseIfNode;

    let elseBlock = null;
    if (elseNode) {
        if (elseNode.type === 'ElseBlock') {
            elseBlock = bBlockStatement(elseNode.children, cxt, true);
        } else {
            elseBlock = bIfStatement(elseNode, cxt);
        }
    }

    return b.ifStatement(
        expressionIrToEs(condition, cxt),
        bBlockStatement(children, cxt, true),
        elseBlock
    );
}

export const IfBlock: Transformer<IrIfBlock | IrElseifBlock> = function IfBlock(node, cxt) {
    return [bIfStatement(node, cxt)];
};
