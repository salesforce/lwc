/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { produce } from 'immer';
import { builders as b, is } from 'estree-toolkit';
import { kebabCaseToCamelCase } from '@lwc/shared';
import { bAttributeValue, optimizeAdjacentYieldStmts } from '../../shared';
import { esTemplate, esTemplateWithYield } from '../../../estemplate';
import { irChildrenToEs, irToEs } from '../../ir-to-es';
import { isLiteral } from '../../shared';
import { expressionIrToEs } from '../../expression';
import { isNullableOf } from '../../../estree/validators';
import { isLastConcatenatedNode } from '../../adjacent-text-nodes';

import type {
    CallExpression as EsCallExpression,
    Expression as EsExpression,
    Statement as EsStatement,
    ExpressionStatement as EsExpressionStatement,
    FunctionDeclaration as EsFunctionDeclaration,
    VariableDeclaration as EsVariableDeclaration,
} from 'estree';
import type {
    ChildNode as IrChildNode,
    Component as IrComponent,
    Element as IrElement,
    ElseBlock as IrElseBlock,
    ElseifBlock as IrElseifBlock,
    ExternalComponent as IrExternalComponent,
    If as IrIf,
    IfBlock as IrIfBlock,
    LwcComponent as IrLwcComponent,
    ScopedSlotFragment as IrScopedSlotFragment,
    Text as IrText,
    Slot as IrSlot,
} from '@lwc/template-compiler';
import type { TransformerContext } from '../../types';

const slotAttributeValueAssignment =
    esTemplate`const slotAttributeValue = null;`<EsVariableDeclaration>();

const bGenerateShadowSlottedContent = esTemplateWithYield`
    async function* ${/* function name */ is.identifier}(contextfulParent, Cmp) {
        // The 'contextfulParent' variable is shadowed here so that a contextful relationship
        // is established between components rendered in slotted content & the "parent"
        // component that contains the <slot>.
        ${/* shadow slot content */ is.statement}
    }
`<EsFunctionDeclaration>;
const bGenerateShadowSlottedContentRef = esTemplateWithYield`
    const shadowSlottedContent = ${/* reference to hoisted fn */ is.identifier};
`<EsVariableDeclaration>;
const bNullishGenerateShadowSlottedContent = esTemplateWithYield`
    const shadowSlottedContent = null;
`<EsVariableDeclaration>;

const bContentMap = esTemplateWithYield`
    const ${/* name of the content map */ is.identifier} = Object.create(null);
`<EsVariableDeclaration>;
const bNullishContentMap = esTemplateWithYield`
    const ${/* name of the content map */ is.identifier} = null;
`<EsVariableDeclaration>;

const bGenerateSlottedContent = esTemplateWithYield`
    ${/* const shadowSlottedContent = ... */ is.variableDeclaration}
    ${/* const lightSlottedContentMap */ is.variableDeclaration}
    ${/* const scopedSlottedContentMap */ is.variableDeclaration}
    ${/* light DOM addLightContent statements */ is.expressionStatement}
    ${/* scoped slot addLightContent statements */ is.expressionStatement}
`<EsStatement[]>;

// Note that this function name (`__lwcGenerateSlottedContent`) does not need to be scoped even though
// it may be repeated multiple times in the same scope, because it's a function _expression_ rather
// than a function _declaration_, so it isn't available to be referenced anywhere.
const bAddSlottedContent = esTemplate`
    addSlottedContent(
        ${/* slot name */ is.expression} ?? "",
        async function* __lwcGenerateSlottedContent(
            contextfulParent,
            ${/* scoped slot data variable */ isNullableOf(is.identifier)},
            slotAttributeValue)
        {
            ${/* slot content */ is.statement}
        },
        ${/* content map */ is.identifier}
    );
`<EsCallExpression>;

function getShadowSlottedContent(slottableChildren: IrChildNode[], cxt: TransformerContext) {
    return optimizeAdjacentYieldStmts(
        irChildrenToEs(slottableChildren, cxt, (child) => {
            const { isSlotted } = cxt;

            if (child.type === 'ExternalComponent' || child.type === 'Element') {
                cxt.isSlotted = false;
            }

            // cleanup function
            return () => {
                cxt.isSlotted = isSlotted;
            };
        })
    );
}

// Light DOM slots are a bit complex because of needing to handle slots _not_ at the top level
// At the non-top level, it matters what the ancestors are. These are relevant to slots:
// - If (`if:true`, `if:false`)
// - IfBlock/ElseBlock/ElseifBlock (`lwc:if`, `lwc:elseif`, `lwc:else`)
// Whereas anything else breaks the relationship between the slotted content and the containing
// Component (e.g. another Component/ExternalComponent) or is disallowed (e.g. ForEach/ForOf).
// Then there are the leaf nodes, which _may_ have a `slot` attribute on them:
// - Element/Text/Component/ExternalComponent (e.g. `<div>`, `<x-foo>`)
// Once you reach a leaf, you know what content should be rendered for a given slot name. But you
// also need to consider all of its ancestors, which may cause the slot content to be conditionally
// rendered (e.g. IfBlock/ElseBlock).
// For example:
//     <x-foo>
//         <template lwc:if={darkTheme}>
//             <div slot="footer"></div>
//         </template>
//         <template lwc:else>
//             yolo
//         </template>
//     </x-foo>
// In this example, we render the `<div>` into the `footer` slot, if `darkTheme` is true.
// Otherwise, we will render the text node `yolo` into the default slot.
// The goal here is to traverse through the tree and identify all unique `slot` attribute names
// and group those into AST trees on a per-`slot` name basis, only for leafs/ancestors that are
// relevant to slots (as mentioned above).
function getLightSlottedContent(rootNodes: IrChildNode[], cxt: TransformerContext) {
    type SlottableAncestorIrType = IrIf | IrIfBlock | IrElseifBlock | IrElseBlock;
    type SlottableLeafIrType = IrElement | IrText | IrComponent | IrExternalComponent | IrSlot;

    const results: EsExpressionStatement[] = [];

    // For the given slot name, get the EsExpressions we should use to render it
    // The ancestorIndices is an array of integers referring to the chain of ancestors
    // and their positions in the child arrays of their own parents
    const addLightDomSlotContent = (slotName: EsExpression, ancestorIndices: number[]) => {
        const clone = produce(rootNodes[ancestorIndices[0]], (draft) => {
            // Create a clone of the AST with only the ancestors and no other siblings
            let current = draft;
            for (let i = 1; i < ancestorIndices.length; i++) {
                const nextIndex = ancestorIndices[i];

                // If i >= 1 then the current must necessarily be a SlottableAncestorIrType
                const next = (current as SlottableAncestorIrType).children[nextIndex];
                (current as SlottableAncestorIrType).children = [next];
                current = next;
            }
            // The leaf must necessarily be a SlottableLeafIrType
            const leaf = current as SlottableLeafIrType;
            // Light DOM slots do not actually render the `slot` attribute.
            if (leaf.type !== 'Text') {
                leaf.attributes = leaf.attributes.filter((attr) => attr.name !== 'slot');
            }
        });
        const { isSlotted: originalIsSlotted } = cxt;
        cxt.isSlotted = ancestorIndices.length > 1 || clone.type === 'Slot';
        const slotContent = optimizeAdjacentYieldStmts(irToEs(clone, cxt));
        cxt.isSlotted = originalIsSlotted;
        results.push(
            b.expressionStatement(
                bAddSlottedContent(
                    slotName,
                    null,
                    slotContent,
                    b.identifier('lightSlottedContentMap')
                )
            )
        );
    };

    const traverse = (nodes: IrChildNode[], ancestorIndices: number[]) => {
        for (let i = 0; i < nodes.length; i++) {
            // must set the siblings inside the for loop due to nested children
            cxt.siblings = nodes;
            cxt.currentNodeIndex = i;
            const node = nodes[i];
            switch (node.type) {
                // SlottableAncestorIrType
                case 'If':
                case 'IfBlock':
                case 'ElseifBlock':
                case 'ElseBlock': {
                    traverse(node.children, [...ancestorIndices, i]);
                    break;
                }
                // SlottableLeafIrType
                case 'Slot':
                case 'Element':
                case 'Text':
                case 'Component':
                case 'ExternalComponent': {
                    // '' is the default slot name. Text nodes are always slotted into the default slot
                    const slotName =
                        node.type === 'Text' ? b.literal('') : bAttributeValue(node, 'slot');

                    // For concatenated adjacent text nodes, for any but the final text node, we
                    // should skip them and let the final text node take care of rendering its siblings
                    if (node.type === 'Text' && !isLastConcatenatedNode(cxt)) {
                        continue;
                    }

                    addLightDomSlotContent(slotName, [...ancestorIndices, i]);
                    break;
                }
            }
        }
        // reset the context
        cxt.siblings = undefined;
        cxt.currentNodeIndex = undefined;
    };

    traverse(rootNodes, []);
    return results;
}

export function getSlottedContent(
    node: IrLwcComponent | IrComponent,
    cxt: TransformerContext
): EsStatement[] {
    const { isSlotted } = cxt;

    cxt.isSlotted = true;

    // Anything inside the slotted content is a normal slotted content except for `<template lwc:slot-data>` which is a scoped slot.
    const slottableChildren = node.children.filter((child) => child.type !== 'ScopedSlotFragment');
    const scopedSlottableChildren = node.children.filter(
        (child) => child.type === 'ScopedSlotFragment'
    ) as IrScopedSlotFragment[];

    const shadowSlotContent = getShadowSlottedContent(slottableChildren, cxt);

    const lightSlotContent = getLightSlottedContent(slottableChildren, cxt);

    const scopedSlotContent = scopedSlottableChildren.map((child) => {
        const boundVariableName = child.slotData.value.name;
        const boundVariable = b.identifier(boundVariableName);
        cxt.pushLocalVars([boundVariableName]);

        const slotName = isLiteral(child.slotName)
            ? b.literal(child.slotName.value)
            : expressionIrToEs(child.slotName, cxt);

        // TODO [#4768]: what if the bound variable is `generateMarkup` or some framework-specific identifier?
        const addLightContentExpr = b.expressionStatement(
            bAddSlottedContent(
                slotName,
                boundVariable,
                optimizeAdjacentYieldStmts(irChildrenToEs(child.children, cxt)),
                b.identifier('scopedSlottedContentMap')
            )
        );
        cxt.popLocalVars();
        return addLightContentExpr;
    });

    const hasShadowSlottedContent = shadowSlotContent.length > 0;
    const hasLightSlottedContent = lightSlotContent.length > 0;
    const hasScopedSlottedContent = scopedSlotContent.length > 0;
    cxt.isSlotted = isSlotted;

    if (hasShadowSlottedContent || hasLightSlottedContent || hasScopedSlottedContent) {
        cxt.import('addSlottedContent');
    }

    const uniqueNodeId = `${node.name}:${node.location.start}:${node.location.end}`;

    if (hasShadowSlottedContent && !cxt.slots.shadow.isDuplicate(uniqueNodeId)) {
        cxt.hoist(slotAttributeValueAssignment, slotAttributeValueAssignment);
        const kebabCmpName = kebabCaseToCamelCase(node.name);
        const shadowSlotContentFnName = cxt.slots.shadow.register(uniqueNodeId, kebabCmpName);
        const shadowSlottedContentFn = bGenerateShadowSlottedContent(
            b.identifier(shadowSlotContentFnName),
            shadowSlotContent
        );
        cxt.hoist(shadowSlottedContentFn, node);
    }

    const shadowSlottedContentFn = hasShadowSlottedContent
        ? bGenerateShadowSlottedContentRef(b.identifier(cxt.slots.shadow.getFnName(uniqueNodeId)!))
        : bNullishGenerateShadowSlottedContent();
    const lightSlottedContentMap = hasLightSlottedContent
        ? bContentMap(b.identifier('lightSlottedContentMap'))
        : bNullishContentMap(b.identifier('lightSlottedContentMap'));
    const scopedSlottedContentMap = hasScopedSlottedContent
        ? bContentMap(b.identifier('scopedSlottedContentMap'))
        : bNullishContentMap(b.identifier('scopedSlottedContentMap'));

    return bGenerateSlottedContent(
        shadowSlottedContentFn,
        lightSlottedContentMap,
        scopedSlottedContentMap,
        lightSlotContent,
        scopedSlotContent
    );
}
