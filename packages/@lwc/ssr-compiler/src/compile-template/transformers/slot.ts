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
import type { Expression as EsExpression, Statement as EsStatement } from 'estree';
import type { Transformer } from '../types';

const bConditionalSlot = esTemplate`
    if (isLightDom) {
        const generator = slottedContent[${is.expression} ?? ""];
        if (generator) {
            yield* generator();
        } else {
            // TODO: default/fallback slot content
        }
    } else {
        ${is.statement}
    }
`;

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

    return bConditionalSlot(slotName, Element(node, ctx));
};
