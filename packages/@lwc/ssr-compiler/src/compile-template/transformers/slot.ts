/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b } from 'estree-toolkit';

import { esTemplateWithYield } from '../../estemplate';

import { irChildrenToEs } from '../ir-to-es';
import { bAttributeValue, getScopedExpression } from '../shared';
import { isNullableOf } from '../../estree/validators';
import { Element } from './element';
import type { Slot as IrSlot } from '@lwc/template-compiler';
import type {
    Statement as EsStatement,
    IfStatement as EsIfStatement,
    Expression as EsExpression,
} from 'estree';
import type { Transformer } from '../types';

const bConditionalSlot = esTemplateWithYield`
    if (isLightDom) {
        const isScopedSlot = ${/* isScopedSlot */ is.literal};
        const isSlotted = ${/* isSlotted */ is.literal};
        // start bookend HTML comment for light DOM slot vfragment
        if (!isSlotted) {
            yield '<!---->';
        }

        // scoped slot factory has its own vfragment hence its own bookend
        if (isScopedSlot) {
            yield '<!---->';
        }

        const generators = lightSlottedContent?.[${/* slotName */ is.expression} ?? ""];
        if (generators) {
            for (const generator of generators) {
                yield* generator(contextfulParent, ${/* scoped slot data */ isNullableOf(is.expression)});
            }
        } else {
            // If we're in this else block, then the generator _must_ have yielded
            // something. It's impossible for a slottedContent["foo"] to exist
            // without the generator yielding at least a text node / element.
            // FIXME: how does this work with comments and lwc:preserve-comments?
            // TODO: default/fallback slot content
            ${/* slot fallback content */ is.statement}
        }
        
        // scoped slot factory has its own vfragment hence its own bookend
        if (isScopedSlot) {
            yield '<!---->';
        }

        // end bookend HTML comment for light DOM slot vfragment
        if (!isSlotted) {
            yield '<!---->';
        }
    } else {
        ${/* slot element AST */ is.statement}
    }
`<EsIfStatement>;

export const Slot: Transformer<IrSlot> = function Slot(node, ctx): EsStatement[] {
    const slotBindDirective = node.directives.find((dir) => dir.name === 'SlotBind');
    const slotBound = slotBindDirective?.value
        ? getScopedExpression(slotBindDirective.value as EsExpression, ctx)
        : null;
    const slotName = bAttributeValue(node, 'name');
    // FIXME: avoid serializing the slot's children twice
    const slotAst = Element(node, ctx);
    const slotChildren = irChildrenToEs(node.children, ctx);
    const isScopedSlot = b.literal(Boolean(slotBound));
    const isSlotted = b.literal(Boolean(ctx.isSlotted));
    return [bConditionalSlot(isScopedSlot, isSlotted, slotName, slotBound, slotChildren, slotAst)];
};
