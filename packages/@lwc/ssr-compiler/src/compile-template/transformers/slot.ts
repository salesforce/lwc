/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b } from 'estree-toolkit';

import { esTemplateWithYield } from '../../estemplate';

import { irChildrenToEs } from '../ir-to-es';
import { bAttributeValue } from '../shared';
import { isNullableOf } from '../../estree/validators';
import { getScopedExpression } from '../expression';
import { Element } from './element';
import type { Slot as IrSlot } from '@lwc/template-compiler';
import type { Statement as EsStatement, IfStatement as EsIfStatement } from 'estree';
import type { Transformer } from '../types';

const bConditionalSlot = esTemplateWithYield`
    if (isLightDom) {
        const isScopedSlot = ${/* isScopedSlot */ is.literal};
        const isSlotted = ${/* isSlotted */ is.literal};
        const slotName = ${/* slotName */ is.expression};
        const lightGenerators = lightSlottedContent?.[slotName ?? ""];
        const scopedGenerators = scopedSlottedContent?.[slotName ?? ""];
        const mismatchedSlots = isScopedSlot ? lightGenerators : scopedGenerators;
        const generators = isScopedSlot ? scopedGenerators : lightGenerators;
        /* 
            If a slotAttributeValue is present, it should be provided for assignment to any slotted content. This behavior aligns with v1 and engine-dom.
            See: engine-server/src/__tests__/fixtures/slot-forwarding/slots/dangling/ for example.
            Note the slot mapping does not work for scoped slots, so the slot name is not rendered in this case.
            See: engine-server/src/__tests__/fixtures/slot-forwarding/scoped-slots for example.
        */
        const danglingSlotName = !isScopedSlot ? ${/* slotAttributeValue */ is.expression} || slotAttributeValue : null;
        // start bookend HTML comment for light DOM slot vfragment
        if (!isSlotted) {
            yield '<!---->';

            // If there is slot data, scoped slot factory has its own vfragment hence its own bookend
            if (isScopedSlot && generators) {
                yield '<!---->';
            }
        }

        if (generators) {
            for (let i = 0; i < generators.length; i++) {
                yield* generators[i](contextfulParent, ${/* scoped slot data */ isNullableOf(is.expression)}, danglingSlotName);
                // Scoped slotted data is separated by bookends. Final bookends are added outside of the loop below.
                if (isScopedSlot && i < generators.length - 1) {
                    yield '<!---->';
                    yield '<!---->';
                }
            }
        /* 
            If there were mismatched slots, do not fallback to the default. This is required for parity with
            engine-core which resets children to an empty array when there are children (mismatched or not). 
            Because the child nodes are reset, the default slotted content is not rendered in the mismatched slot case. 
            See https://github.com/salesforce/lwc/blob/master/packages/%40lwc/engine-core/src/framework/api.ts#L238
        */
        } else if (!mismatchedSlots) {
            // If we're in this else block, then the generator _must_ have yielded
            // something. It's impossible for a slottedContent["foo"] to exist
            // without the generator yielding at least a text node / element.
            ${/* slot fallback content */ is.statement}
        }

        // end bookend HTML comment for light DOM slot vfragment
        if (!isSlotted) {
            yield '<!---->';

            // If there is slot data, scoped slot factory has its own vfragment hence its own bookend
            if (isScopedSlot && generators) {
                yield '<!---->';
            }
        }
    } else {
        ${/* slot element AST */ is.statement}
    }
`<EsIfStatement>;

export const Slot: Transformer<IrSlot> = function Slot(node, ctx): EsStatement[] {
    const slotBindDirective = node.directives.find((dir) => dir.name === 'SlotBind');
    const slotBound = slotBindDirective?.value
        ? getScopedExpression(slotBindDirective.value, ctx)
        : null;
    const slotName = bAttributeValue(node, 'name');
    // FIXME: avoid serializing the slot's children twice
    const slotAst = Element(node, ctx);
    const slotChildren = irChildrenToEs(node.children, ctx);
    const isScopedSlot = b.literal(Boolean(slotBound));
    const isSlotted = b.literal(Boolean(ctx.isSlotted));
    const slotAttributeValue = bAttributeValue(node, 'slot');
    return [
        bConditionalSlot(
            isScopedSlot,
            isSlotted,
            slotName,
            slotAttributeValue,
            slotBound,
            slotChildren,
            slotAst
        ),
    ];
};
