/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { inspect } from 'util';

import { Comment } from './comment';
import { Component } from './component';
import { Element } from './element';
import { ForEach } from './for-each';
import { If, IfBlock } from './if';
import { Text } from './text';
import { createNewContext } from './context';

import type { Node as IrNode, Root as IrRoot } from '@lwc/template-compiler';
import type { Statement as EsStatement } from 'estree';
import type { TemplateOpts, Transformer, TransformerContext } from './types';

const Root: Transformer<IrRoot> = function Root(node, cxt): EsStatement[] {
    return node.children.map((child) => irToEs(child, cxt)).flat();
};

const transformers: Record<string, Transformer> = {
    Comment: Comment as Transformer<IrNode>,
    Component: Component as Transformer<IrNode>,
    Root: Root as Transformer<IrNode>,
    Text: Text as Transformer<IrNode>,
    Element: Element as Transformer<IrNode>,
    ForEach: ForEach as Transformer<IrNode>,
    If: If as Transformer<IrNode>,
    IfBlock: IfBlock as Transformer<IrNode>,
};

const defaultTransformer: Transformer = (node: IrNode) => {
    throw new Error(`Unimplemented IR node: ${inspect(node)}`);
};

export function irToEs(node: IrNode, cxt: TransformerContext): EsStatement[] {
    const transformer = transformers[node.type] ?? defaultTransformer;
    return transformer(node, cxt);
}

export function templateIrToEsTree(node: IrNode, contextOpts: TemplateOpts) {
    const { hoisted, cxt } = createNewContext(contextOpts);
    const statements = irToEs(node, cxt);
    return {
        hoisted: hoisted.values(),
        statements,
    };
}
