/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { inspect } from 'util';

import { is, builders as b } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { Comment } from './transformers/comment';
import { Component, LwcComponent } from './transformers/component';
import { Element } from './transformers/element';
import { ForEach } from './transformers/for-each';
import { ForOf } from './transformers/for-of';
import { LegacyIf } from './transformers/legacyIf';
import { Slot } from './transformers/slot';
import { Text } from './transformers/text';
import { createNewContext } from './context';
import { IfBlock } from './transformers/lwcIf';
import type {
    ChildNode as IrChildNode,
    Comment as IrComment,
    Node as IrNode,
    Root as IrRoot,
    Text as IrText,
} from '@lwc/template-compiler';
import type { Statement as EsStatement, ThrowStatement as EsThrowStatement } from 'estree';
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
    Text,
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

const mergeTextNodes = (
    nodes: Array<IrComment | IrText>,
    cxt: TransformerContext
): EsStatement[] => {
    // TODO
};

export function irChildrenToEs(
    children: IrChildNode[],
    cxt: TransformerContext,
    cb?: (child: IrChildNode) => (() => void) | void
): EsStatement[] {
    const result: EsStatement[] = [];
    const adjacentTextNodes: Array<IrComment | IrText> = [];
    for (const child of children) {
        if (isConcatenatableTextNode(child, cxt)) {
            // Don't add this node yet -- wait until we've found all adjacent text nodes
            adjacentTextNodes.push(child);
        } else {
            if (adjacentTextNodes.length > 0) {
                // We've reached another node type -- flush the buffer of text nodes
                result.push(...mergeTextNodes(adjacentTextNodes, cxt));
                adjacentTextNodes.length = 0;
            }
            result.push(...irChildToEs(child, cxt, cb));
        }
    }

    // Add any remaining text nodes
    if (adjacentTextNodes.length > 0) {
        const mergedNode = mergeTextNodes(adjacentTextNodes, cxt);
        result.push(...mergedNode);
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
