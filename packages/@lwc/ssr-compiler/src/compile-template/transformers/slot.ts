/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';

import { Slot as IrSlot } from '@lwc/template-compiler';
import { esTemplateWithYield } from '../../estemplate';

import { irChildrenToEs } from '../ir-to-es';
import { bAttributeValue } from '../shared';
import { Element } from './element';
import type { Statement as EsStatement, IfStatement as EsIfStatement } from 'estree';
import type { Transformer } from '../types';

const bConditionalSlot = esTemplateWithYield`
    if (isLightDom) {
        // start bookend HTML comment
        yield '<!---->';

        const generators = slottedContent?.light?.[${/* slotName */ is.expression} ?? ""];
        if (generators) {
            for (const generator of generators) {
                yield* generator();
            }
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
    const slotName = bAttributeValue(node, 'name');
    // FIXME: avoid serializing the slot's children twice
    const slotAst = Element(node, ctx);
    const slotChildren = irChildrenToEs(node.children, ctx);
    return [bConditionalSlot(slotName, slotChildren, slotAst)];
};
