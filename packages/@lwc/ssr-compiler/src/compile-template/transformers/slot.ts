/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';

import { Slot as IrSlot } from '@lwc/template-compiler';
import { esTemplate } from '../../estemplate';

import { Element } from './element';
import type { Expression as EsExpression, Statement as EsStatement, IfStatement as EsIfStatement } from 'estree';
import type {Transformer, TransformerContext} from '../types';
import {irChildrenToEs, irToEs} from "../ir-to-es";
import type {ChildNode as IrChildNode} from "@lwc/template-compiler/dist/shared/types";

const bConditionalSlot = esTemplate`
    if (isLightDom) {
        // FIXME: why do we need yield*?
        // start bookend HTML comment
        yield* '<!---->';

        const generator = slottedContent[${/* slotName */ is.expression} ?? ""];
        if (generator) {
            yield* generator();
        } else {
            // If we're in this else block, then the generator _must_ have yielded
            // something. It's impossible for a slottedContent["foo"] to exist
            // without the generator yielding at least a text node / element.
            // FIXME: how does this work with comments and lwc:preserve-comments?
            // TODO: default/fallback slot content
        }

        // FIXME: why do we need yield*?
        // end bookend HTML comment
        yield* '<!---->';
    } else {
        ${/* slot element AST */ is.statement}
    }
`<EsIfStatement>;

export function bYieldLightDomSlotChildren(slot: IrSlot, cxt: TransformerContext): EsStatement[] {
    // FIXME: how does light DOM handle slot attributes that aren't immediate children of the <slot>?
    const result = children.flatMap((child, idx) => {
        cxt.prevSibling = children[idx - 1];
        cxt.nextSibling = children[idx + 1];
        return irToEs(child, cxt);
    });
    cxt.prevSibling = undefined;
    cxt.nextSibling = undefined;
    return result;
}

export const Slot: Transformer<IrSlot> = function Slot(node, ctx): EsStatement[] {
    const nameAttrValue = node.attributes.find((attr) => attr.name === 'name')?.value;
    let slotName: EsExpression;
    if (!nameAttrValue) {
        slotName = b.literal('');
    } else if (nameAttrValue.type === 'Literal') {
        const name = typeof nameAttrValue.value === 'string' ? nameAttrValue.value : '';
        slotName = b.literal(name);
    } else {
        slotName = b.memberExpression(b.literal('instance'), nameAttrValue as EsExpression);
    }

    // FIXME: avoid serializing the slot's children twice
    const slotAst = Element(node, ctx);



    const slotChildren = irChildrenToEs(node.children, ctx);

    return bConditionalSlot(slotName, slotAst);
};
