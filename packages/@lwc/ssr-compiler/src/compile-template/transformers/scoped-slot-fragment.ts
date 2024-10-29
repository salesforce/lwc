/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ScopedSlotFragment as IrScopedSlotFragment } from '@lwc/template-compiler';
import { produce } from 'immer';
import { builders as b, is } from 'estree-toolkit';
import { CallExpression as EsCallExpression, Statement } from 'estree';
import { bAttributeValue } from '../shared';
import { irToEs } from '../ir-to-es';
import { esTemplate } from '../../estemplate';
import { isNullableOf } from '../../estree/validators';
import type { Transformer } from '../types';

const bAddContent = esTemplate`
    addContentNew(${/* slot name */ is.expression} ?? "", async function* (${/* scoped slot data */ isNullableOf(is.identifier)}) {
        ${/* slot content */ is.statement}
    });
`<EsCallExpression>;

export const ScopedSlotFragment: Transformer<IrScopedSlotFragment> = function ScopedSlotFragment(
    node,
    cxt
) {
    const slotName = bAttributeValue(node, 'slot');
    const slotContent = node.children.map((child) => {
        const slotContent = irToEs(child, cxt);
        return bAddContent(slotName, null, slotContent);
    });
    return slotContent as any;
};
