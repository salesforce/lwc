/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { traverse, builders as b, type NodePath } from 'estree-toolkit';
import { produce } from 'immer';
import type { FunctionDeclaration, FunctionExpression, Node } from 'estree';
import type { Program as EsProgram } from 'estree';
import type { Node as EstreeToolkitNode } from 'estree-toolkit/dist/helpers';

export type TransmogrificationMode = 'sync' | 'async';

interface TransmogrificationState {
    mode: TransmogrificationMode;
}

export type Visitors = Parameters<typeof traverse<Node, TransmogrificationState>>[1];

const EMIT_IDENT = b.identifier('$$emit');
// Rollup may rename variables to prevent shadowing. When it does, it uses the format `foo$0`, `foo$1`, etc.
const TMPL_FN_PATTERN = /tmpl($\d+)?/;
const GEN_MARKUP_OR_GEN_SLOTTED_CONTENT_PATTERN = /generate(?:Markup|SlottedContent)($\d+)?/;

const isWithinFn = (pattern: RegExp, nodePath: NodePath): boolean => {
    const { node } = nodePath;
    if (!node) {
        return false;
    }
    if (
        (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') &&
        node.id &&
        pattern.test(node.id.name)
    ) {
        return true;
    }
    if (nodePath.parentPath) {
        return isWithinFn(pattern, nodePath.parentPath);
    }
    return false;
};

function transformFunction(
    path: NodePath<FunctionDeclaration | FunctionExpression, EstreeToolkitNode>,
    state: TransmogrificationState
): undefined {
    const { node } = path;
    if (!node?.async || !node?.generator) {
        return;
    }

    // Component authors might conceivably use async generator functions in their own code. Therefore,
    // when traversing & transforming written+generated code, we need to disambiguate generated async
    // generator functions from those that were written by the component author.
    if (
        !isWithinFn(GEN_MARKUP_OR_GEN_SLOTTED_CONTENT_PATTERN, path) &&
        !isWithinFn(TMPL_FN_PATTERN, path)
    ) {
        return;
    }
    node.generator = false;
    node.async = state.mode === 'async';
    node.params.unshift(EMIT_IDENT);
}

const visitors: Visitors = {
    FunctionDeclaration: transformFunction,
    FunctionExpression: transformFunction,
    YieldExpression(path, state) {
        const { node } = path;
        if (!node) {
            return;
        }

        // Component authors might conceivably use generator functions within their own code. Therefore,
        // when traversing & transforming written+generated code, we need to disambiguate generated yield
        // expressions from those that were written by the component author.
        if (
            !isWithinFn(TMPL_FN_PATTERN, path) &&
            !isWithinFn(GEN_MARKUP_OR_GEN_SLOTTED_CONTENT_PATTERN, path)
        ) {
            return;
        }

        if (node.delegate) {
            // transform `yield* foo(arg)` into `foo($$emit, arg)` or `await foo($$emit, arg)`
            if (node.argument?.type !== 'CallExpression') {
                throw new Error(
                    'Implementation error: cannot transmogrify complex yield-from expressions'
                );
            }

            const callExpr = node.argument;
            callExpr.arguments.unshift(EMIT_IDENT);

            path.replaceWith(state.mode === 'sync' ? callExpr : b.awaitExpression(callExpr));
        } else {
            // transform `yield foo` into `$$emit(foo)`
            const emittedExpression = node.argument;
            if (!emittedExpression) {
                throw new Error(
                    'Implementation error: cannot transform a yield expression that yields nothing'
                );
            }

            path.replaceWith(b.callExpression(EMIT_IDENT, [emittedExpression]));
        }
    },
    ImportSpecifier(path, _state) {
        // @lwc/ssr-runtime has a couple of helper functions that need to conform to either the generator or
        // no-generator compilation mode/paradigm. Since these are simple helper functions, we can maintain
        // two implementations of each helper method:
        //
        // - renderAttrs vs renderAttrsNoYield
        // - fallbackTmpl vs fallbackTmplNoYield
        //
        // If this becomes too burdensome to maintain, we can officially deprecate the generator-based approach
        // and switch the @lwc/ssr-runtime implementation wholesale over to the no-generator paradigm.

        const { node } = path;
        if (!node || node.imported.type !== 'Identifier') {
            throw new Error(
                'Implementation error: unexpected missing identifier in import specifier'
            );
        }

        if (
            path.parent?.type !== 'ImportDeclaration' ||
            path.parent.source.value !== '@lwc/ssr-runtime'
        ) {
            return;
        }

        if (node.imported.name === 'fallbackTmpl') {
            node.imported.name = 'fallbackTmplNoYield';
        } else if (node.imported.name === 'renderAttrs') {
            node.imported.name = 'renderAttrsNoYield';
        }
    },
};

/**
 * Transforms async-generator code into either the async or synchronous alternatives that are
 * ~semantically equivalent. For example, this template:
 *
 *   <template>
 *       <div>foobar</div>
 *       <x-child></x-child>
 *   </template>
 *
 * Is compiled into the following JavaScript, intended for execution during SSR & stripped down
 * for the purposes of this example:
 *
 *   async function* tmpl(props, attrs, slottedContent, Cmp, instance) {
 *       yield '<div>foobar</div>';
 *       const childProps = {};
 *       const childAttrs = {};
 *       yield* generateChildMarkup("x-child", childProps, childAttrs, childSlottedContentGenerator);
 *   }
 *
 * When transmogrified in async-mode, the above generated template function becomes the following:
 *
 *   async function tmpl($$emit, props, attrs, slottedContent, Cmp, instance) {
 *       $$emit('<div>foobar</div>');
 *       const childProps = {};
 *       const childAttrs = {};
 *       await generateChildMarkup($$emit, "x-child", childProps, childAttrs, childSlottedContentGenerator);
 *   }
 *
 * When transmogrified in sync-mode, the template function becomes the following:
 *
 *   function tmpl($$emit, props, attrs, slottedContent, Cmp, instance) {
 *       $$emit('<div>foobar</div>');
 *       const childProps = {};
 *       const childAttrs = {};
 *       generateChildMarkup($$emit, "x-child", childProps, childAttrs, childSlottedContentGenerator);
 *   }
 *
 * There are tradeoffs for each of these modes. Notably, the async-yield variety is the easiest to transform
 * into either of the other varieties and, for that reason, is the variety that is "authored" by the SSR compiler.
 */
export function transmogrify(
    compiledComponentAst: EsProgram,
    mode: TransmogrificationMode = 'sync'
): EsProgram {
    const state: TransmogrificationState = {
        mode,
    };

    return produce(compiledComponentAst, (astDraft) => traverse(astDraft, visitors, state));
}
