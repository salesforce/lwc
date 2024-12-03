/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { produce } from 'immer';
import { builders as b, is } from 'estree-toolkit';
import { bAttributeValue, optimizeAdjacentYieldStmts } from '../../shared';
import { esTemplate, esTemplateWithYield } from '../../../estemplate';
import { irChildrenToEs, irToEs } from '../../ir-to-es';
import { isNullableOf } from '../../../estree/validators';
import type { CallExpression as EsCallExpression, Expression as EsExpression } from 'estree';

import type { Statement as EsStatement } from 'estree';
import type {
    Component as IrComponent,
    LwcComponent as IrLwcComponent,
    ScopedSlotFragment,
} from '@lwc/template-compiler';
import type { TransformerContext } from '../../types';

const bGenerateSlottedContent = esTemplateWithYield`
        const shadowSlottedContent = ${/* hasShadowSlottedContent */ is.literal}
            ? async function* generateSlottedContent(instance) {
                // The 'instance' variable is shadowed here so that a contextful relationship
                // is established between components rendered in slotted content & the "parent"
                // component that contains the <slot>.
                ${/* shadow slot content */ is.statement}
            } 
            // Avoid creating the object unnecessarily
            : null;

        const lightSlottedContentChildren = ${/* hasLightSlottedContent */ is.literal} 
            ? Object.create(null)
            // Avoid creating the object unnecessarily
            : null;
        
        function addLightContent(name, fn) {
            let contentList = lightSlottedContentChildren[name];
            if (contentList) {
                contentList.push(fn);
            } else {
                lightSlottedContentChildren[name] = [fn];
            }
        }

        ${/* light DOM addLightContent statements */ is.expressionStatement}
        ${/* scoped slot addLightContent statements */ is.expressionStatement}
`<EsStatement[]>;

// Note that this function name (`generateSlottedContent`) does not need to be scoped even though
// it may be repeated multiple times in the same scope, because it's a function _expression_ rather
// than a function _declaration_, so it isn't available to be referenced anywhere.
const bAddLightContent = esTemplate`
    addLightContent(${/* slot name */ is.expression} ?? "", async function* generateSlottedContent(${
        /* scoped slot data variable */ isNullableOf(is.identifier)
    }) {
        // FIXME: make validation work again  
        ${/* slot content */ false}
    });
`<EsCallExpression>;

export function getSlottedContent(
    node: IrLwcComponent | IrComponent,
    cxt: TransformerContext
): EsStatement[] {
    // Anything inside the slotted content is a normal slotted content except for `<template lwc:slot-data>` which is a scoped slot.
    const slottableChildren = node.children.filter((child) => child.type !== 'ScopedSlotFragment');
    const scopedSlottableChildren = node.children.filter(
        (child) => child.type === 'ScopedSlotFragment'
    ) as ScopedSlotFragment[];

    const shadowSlotContent = optimizeAdjacentYieldStmts(irChildrenToEs(slottableChildren, cxt));

    const lightSlotContent = slottableChildren.map((child) => {
        if ('attributes' in child) {
            const slotName = bAttributeValue(child, 'slot');
            // Light DOM slots do not actually render the `slot` attribute.
            const clone = produce(child, (draft) => {
                draft.attributes = draft.attributes.filter((attr) => attr.name !== 'slot');
            });
            const slotContent = irToEs(clone, cxt);
            return b.expressionStatement(bAddLightContent(slotName, null, slotContent));
        } else {
            return b.expressionStatement(bAddLightContent(b.literal(''), null, irToEs(child, cxt)));
        }
    });

    const scopedSlotContent = scopedSlottableChildren.map((child) => {
        const boundVariableName = child.slotData.value.name;
        const boundVariable = b.identifier(boundVariableName);
        cxt.pushLocalVars([boundVariableName]);
        // TODO [#4768]: what if the bound variable is `generateMarkup` or some framework-specific identifier?
        const addLightContentExpr = b.expressionStatement(
            bAddLightContent(
                child.slotName as EsExpression,
                boundVariable,
                irChildrenToEs(child.children, cxt)
            )
        );
        cxt.popLocalVars();
        return addLightContentExpr;
    });

    const hasShadowSlottedContent = b.literal(shadowSlotContent.length > 0);
    const hasLightSlottedContent = b.literal(
        lightSlotContent.length > 0 || scopedSlotContent.length > 0
    );

    return bGenerateSlottedContent(
        hasShadowSlottedContent,
        shadowSlotContent,
        hasLightSlottedContent,
        lightSlotContent,
        scopedSlotContent
    );
}
