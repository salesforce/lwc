/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { kebabcaseToCamelcase, toPropertyName } from '@lwc/template-compiler';
import { getChildAttrsOrProps } from '../../shared';
import { esTemplateWithYield } from '../../../estemplate';
import { getSlottedContent } from './slottable-content';

import type { BlockStatement as EsBlockStatement } from 'estree';
import type { Component as IrComponent } from '@lwc/template-compiler';
import type { Transformer } from '../../types';

const bYieldFromChildGenerator = esTemplateWithYield`
    {
        const childProps = __getReadOnlyProxy(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        ${/* slotted content */ is.statement}

        const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;

        yield* ${/* generateMarkup */ is.identifier}(
            ${/* tag name */ is.literal}, 
            childProps, 
            childAttrs, 
            slottedContent,
            instance,
            scopeToken,
        );
    }
`<EsBlockStatement>;

// Note that this function name (`generateSlottedContent`) does not need to be scoped even though
// it may be repeated multiple times in the same scope, because it's a function _expression_ rather
// than a function _declaration_, so it isn't available to be referenced anywhere.
// const bAddContent = esTemplate`
//     addContent(${/* slot name */ is.expression} ?? "", async function* generateSlottedContent(${
//         /* scoped slot data variable */ isNullableOf(is.identifier)
//     }) {
//         // FIXME: make validation work again
//         ${/* slot content */ false}
//     });
// `<EsCallExpression>;

export const Component: Transformer<IrComponent> = function Component(node, cxt) {
    // Import the custom component's generateMarkup export.
    const childGeneratorLocalName = `generateMarkup_${toPropertyName(node.name)}`;
    const importPath = kebabcaseToCamelcase(node.name);
    cxt.import({ generateMarkup: childGeneratorLocalName }, importPath);
    cxt.import({ getReadOnlyProxy: '__getReadOnlyProxy' });
    const childTagName = node.name;

    const slottedContent = getSlottedContent(node, cxt);

    // Anything inside the slotted content is a normal slotted content except for `<template lwc:slot-data>` which is a scoped slot.
    // const slottableChildren = node.children.filter((child) => child.type !== 'ScopedSlotFragment');
    // const scopedSlottableChildren = node.children.filter(
    //     (child) => child.type === 'ScopedSlotFragment'
    // ) as ScopedSlotFragment[];

    // const shadowSlotContent = optimizeAdjacentYieldStmts(irChildrenToEs(slottableChildren, cxt));

    // const lightSlotContent = slottableChildren.map((child) => {
    //     if ('attributes' in child) {
    //         const slotName = bAttributeValue(child, 'slot');
    //         // Light DOM slots do not actually render the `slot` attribute.
    //         const clone = produce(child, (draft) => {
    //             draft.attributes = draft.attributes.filter((attr) => attr.name !== 'slot');
    //         });
    //         const slotContent = irToEs(clone, cxt);
    //         return bAddContent(slotName, null, slotContent);
    //     } else {
    //         return bAddContent(b.literal(''), null, irToEs(child, cxt));
    //     }
    // });

    // const scopedSlotContent = scopedSlottableChildren.map((child) => {
    //     const boundVariableName = child.slotData.value.name;
    //     const boundVariable = b.identifier(boundVariableName);
    //     cxt.pushLocalVars([boundVariableName]);
    //     // TODO [#4768]: what if the bound variable is `generateMarkup` or some framework-specific identifier?
    //     const addContentExpr = bAddContent(
    //         child.slotName as EsExpression,
    //         boundVariable,
    //         irChildrenToEs(child.children, cxt)
    //     );
    //     cxt.popLocalVars();
    //     return addContentExpr;
    // });

    return [
        bYieldFromChildGenerator(
            getChildAttrsOrProps(node.properties, cxt),
            getChildAttrsOrProps(node.attributes, cxt),
            // shadowSlotContent,
            // lightSlotContent,
            // scopedSlotContent,
            slottedContent,
            b.identifier(childGeneratorLocalName),
            b.literal(childTagName)
        ),
    ];
};
