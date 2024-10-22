/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';

import { Slot as IrSlot } from '@lwc/template-compiler';
import { esTemplateWithYield } from '../../estemplate';

import { irChildrenToEs } from '../ir-to-es';
import { Element } from './element';
import type {
    Expression as EsExpression,
    Statement as EsStatement,
    IfStatement as EsIfStatement,
} from 'estree';
import type { Transformer } from '../types';

const bConditionalSlot = esTemplateWithYield`
    if (isLightDom) {
        // start bookend HTML comment
        yield '<!---->';

        const generator = slottedContent[${/* slotName */ is.expression} ?? ""];
        if (generator) {
            yield* generator();
        } else {
            // If we're in this else block, then the generator _must_ have yielded
            // something. It's impossible for a slottedContent["foo"] to exist
            // without the generator yielding at least a text node / element.
            // FIXME: how does this work with comments and lwc:preserve-comments?
            // TODO: default/fallback slot content
            ${/* slot fallback content */ is.statement}
        }

        // end bookend HTML comment
        yield '<!---->';
    } else {
        ${/* slot element AST */ is.statement}
    }
`<EsIfStatement>;

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

    return [bConditionalSlot(slotName, slotChildren, slotAst)];
};
