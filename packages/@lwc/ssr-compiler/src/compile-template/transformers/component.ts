/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { produce } from 'immer';
import { builders as b, is } from 'estree-toolkit';
import { kebabcaseToCamelcase, ScopedSlotFragment, toPropertyName } from '@lwc/template-compiler';
import { esTemplate, esTemplateWithYield } from '../../estemplate';
import { bAttributeValue, getChildAttrsOrProps, optimizeAdjacentYieldStmts } from '../shared';
import { esTemplate, esTemplateWithYield } from '../../estemplate';
import { bAttributeValue, optimizeAdjacentYieldStmts } from '../shared';
import { irChildrenToEs, irToEs } from '../ir-to-es';
import { isNullableOf } from '../../estree/validators';
import { bImportDeclaration } from '../../estree/builders';
import type { CallExpression as EsCallExpression, Expression as EsExpression } from 'estree';

import type { BlockStatement as EsBlockStatement } from 'estree';
import type { Component as IrComponent } from '@lwc/template-compiler';
import type { Transformer } from '../types';

const bYieldFromChildGenerator = esTemplateWithYield`
    {
        const childProps = __getReadOnlyProxy(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        const slottedContent = {
            light: Object.create(null),

            // The 'instance' variable is shadowed here so that a contextful relationship
            // is established between components rendered in slotted content & the "parent"
            // component that contains the <slot>.
            shadow: async function* (instance) {
                ${/* shadow slot content */ is.statement}
            }
        };

        function addContent(name, fn) {
            let contentList = slottedContent.light[name]
            if (contentList) {
                contentList.push(fn)
            } else {
                slottedContent.light[name] = [fn]
            }
        }

        ${/* light DOM addContent statements */ is.callExpression}
        ${/* scoped slot addContent statements */ is.callExpression}

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

const bAddContent = esTemplate`
    addContent(${/* slot name */ is.expression} ?? "", async function* (${
        /* scoped slot data variable */ isNullableOf(is.identifier)
    }) {
        // FIXME: make validation work again  
        ${/* slot content */ false}
    });
`<EsCallExpression>;

const bImportGenerateMarkup = (localName: string, importPath: string) =>
    b.importDeclaration(
        [b.importSpecifier(b.identifier('generateMarkup'), b.identifier(localName))],
        b.literal(importPath)
    );

export const Component: Transformer<IrComponent> = function Component(node, cxt) {
    // Import the custom component's generateMarkup export.
    const childGeneratorLocalName = `generateMarkup_${toPropertyName(node.name)}`;
    const importPath = kebabcaseToCamelcase(node.name);
    const componentImport = bImportGenerateMarkup(childGeneratorLocalName, importPath);
    cxt.hoist(componentImport, childGeneratorLocalName);
    cxt.hoist(
        bImportDeclaration([{ getReadOnlyProxy: '__getReadOnlyProxy' }]),
        'import:getReadOnlyProxy'
    );
    const childTagName = node.name;

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
            return bAddContent(slotName, null, slotContent);
        } else {
            return bAddContent(b.literal(''), null, irToEs(child, cxt));
        }
    });

    const scopedSlotContent = scopedSlottableChildren.map((child) => {
        const boundVariableName = child.slotData.value.name;
        const boundVariable = b.identifier(boundVariableName);
        cxt.pushLocalVars([boundVariableName]);
        // TODO [#4768]: what if the bound variable is `generateMarkup` or some framework-specific identifier?
        const addContentExpr = bAddContent(
            child.slotName as EsExpression,
            boundVariable,
            irChildrenToEs(child.children, cxt)
        );
        cxt.popLocalVars();
        return addContentExpr;
    });

    return [
        bYieldFromChildGenerator(
            getChildAttrsOrProps(node.properties, cxt),
            getChildAttrsOrProps(node.attributes, cxt),
            shadowSlotContent,
            lightSlotContent,
            scopedSlotContent,
            b.identifier(childGeneratorLocalName),
            b.literal(childTagName)
        ),
    ];
};
