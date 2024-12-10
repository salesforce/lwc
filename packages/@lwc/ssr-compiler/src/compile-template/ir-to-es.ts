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
import { If, IfBlock } from './transformers/if';
import { Slot } from './transformers/slot';
import { Text } from './transformers/text';
import { createNewContext } from './context';
import type {
    ChildNode as IrChildNode,
    Node as IrNode,
    Root as IrRoot,
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
    If,
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

export function irChildrenToEs(children: IrChildNode[], cxt: TransformerContext): EsStatement[] {
    const result = children.flatMap((child, idx) => {
        cxt.prevSibling = children[idx - 1];
        cxt.nextSibling = children[idx + 1];
        return irToEs(child, cxt);
    });
    cxt.prevSibling = undefined;
    cxt.nextSibling = undefined;
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
