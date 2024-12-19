/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { inspect } from 'util';

import { is, builders as b } from 'estree-toolkit';
import { esTemplate, esTemplateWithYield } from '../estemplate';
import { Comment } from './transformers/comment';
import { Component, LwcComponent } from './transformers/component';
import { Element } from './transformers/element';
import { ForEach } from './transformers/for-each';
import { ForOf } from './transformers/for-of';
import { LegacyIf } from './transformers/legacyIf';
import { Slot } from './transformers/slot';
import { createNewContext } from './context';
import { IfBlock } from './transformers/lwcIf';
import { isLiteral } from './shared';
import { expressionIrToEs } from './expression';
import type {
    ChildNode as IrChildNode,
    Comment as IrComment,
    Node as IrNode,
    Root as IrRoot,
    Text as IrText,
} from '@lwc/template-compiler';
import type {
    Statement as EsStatement,
    ThrowStatement as EsThrowStatement,
    CallExpression as EsCallExpression,
    BlockStatement as EsBlockStatement,
    BinaryExpression as EsBinaryExpression,
} from 'estree';
import type { TemplateOpts, Transformer, TransformerContext } from './types';

const bThrowError = esTemplate`
  throw new Error(${is.literal});
`<EsThrowStatement>;

const Root: Transformer<IrRoot> = function Root(node, cxt): EsStatement[] {
    return irChildrenToEs(node.children, cxt);
};

type Transformers = {
    [K in IrNode['type']]: IrNode extends infer T
        ? T extends IrNode & { type: K }
            ? Transformer<T>
            : never
        : never;
};

const defaultTransformer: Transformer = (node: IrNode) => {
    throw new Error(`Unimplemented IR node: ${inspect(node)}`);
};

const transformers: Transformers = {
    Comment,
    Component,
    Element,
    ExternalComponent: Element,
    ForEach,
    ForOf,
    If: LegacyIf,
    IfBlock,
    Root,
    // Text nodes are always handled by the parent to do adjacent text concatination
    Text: defaultTransformer,
    // lwc:elseif cannot exist without an lwc:if (IfBlock); this gets handled by that transformer
    ElseifBlock: defaultTransformer,
    // lwc:elseif cannot exist without an lwc:elseif (IfBlock); this gets handled by that transformer
    ElseBlock: defaultTransformer,
    ScopedSlotFragment: defaultTransformer,
    Slot,
    Lwc: LwcComponent,
};

const irChildToEs = (
    child: IrChildNode,
    cxt: TransformerContext,
    cb?: (child: IrChildNode) => void | (() => void)
) => {
    const cleanUp = cb?.(child);
    const result = irToEs(child, cxt);
    cleanUp?.();
    return result;
};

const isConcatenatableTextNode = (
    child: IrChildNode,
    cxt: TransformerContext
): child is IrComment | IrText =>
    child.type === 'Text' || (child.type === 'Comment' && !cxt.templateOptions.preserveComments);

const bMassageTextContent = esTemplate`
        // We are at the end of a series of text nodes - flush to a concatenated string
        // We only render the ZWJ if there were actually any dynamic text nodes rendered
        // The ZWJ is just so hydration can compare the SSR'd dynamic text content against
        // the CSR'd text content.
        massageTextContent(${/* string value */ is.expression});
    `<EsCallExpression>;

const bYieldTextContent = esTemplateWithYield`
        // We are at the end of a series of text nodes - flush to a concatenated string
        // We only render the ZWJ if there were actually any dynamic text nodes rendered
        // The ZWJ is just so hydration can compare the SSR'd dynamic text content against
        // the CSR'd text content.
        {
            const text = ${/* string value */ is.expression}
            yield text === '' ? '\u200D' : htmlEscape(text);
        }
        
    `<EsBlockStatement>;

const mergeTextNodes = (nodes: Array<IrText>, cxt: TransformerContext): EsStatement => {
    cxt.import(['htmlEscape', 'massageTextContent']);

    const mergedExpression = nodes
        .map((node) =>
            isLiteral(node.value) ? b.literal(node.value.value) : expressionIrToEs(node.value, cxt)
        )
        .map((expression) => bMassageTextContent(expression))
        .reduce(
            // @ts-expect-error FIXME later
            (accumilator: EsBinaryExpression, expression: EsCallExpression | EsBinaryExpression) =>
                b.binaryExpression('+', accumilator, expression)
        );

    return bYieldTextContent(mergedExpression);
};

export function irChildrenToEs(
    children: IrChildNode[],
    cxt: TransformerContext,
    cb?: (child: IrChildNode) => (() => void) | void
): EsStatement[] {
    const result: EsStatement[] = [];
    const adjacentTextNodes: Array<IrText> = [];
    for (const child of children) {
        if (isConcatenatableTextNode(child, cxt)) {
            // Don't add this node yet -- wait until we've found all adjacent text nodes
            if (child.type === 'Text') {
                adjacentTextNodes.push(child);
            }
        } else {
            if (adjacentTextNodes.length > 0) {
                // We've reached another node type -- flush the buffer of text nodes
                result.push(mergeTextNodes(adjacentTextNodes, cxt));
                adjacentTextNodes.length = 0;
            }
            result.push(...irChildToEs(child, cxt, cb));
        }
    }

    // Add any remaining text nodes
    if (adjacentTextNodes.length > 0) {
        result.push(mergeTextNodes(adjacentTextNodes, cxt));
    }

    return result;
}

export function irToEs<T extends IrNode>(node: T, cxt: TransformerContext): EsStatement[] {
    if ('directives' in node && node.directives.some((d) => d.name === 'Dynamic')) {
        return [
            bThrowError(
                b.literal(
                    'The lwc:dynamic directive is not supported for SSR. Use <lwc:component> instead.'
                )
            ),
        ];
    }
    const transformer = transformers[node.type] as Transformer<T>;
    return transformer(node, cxt);
}

export function templateIrToEsTree(node: IrNode, contextOpts: TemplateOpts) {
    const { getImports, cxt } = createNewContext(contextOpts);
    const statements = irToEs(node, cxt);
    return {
        addImport: cxt.import,
        getImports,
        statements,
    };
}
