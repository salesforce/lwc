/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { traverse, builders as b, type NodePath, is } from 'estree-toolkit';
import { produce } from 'immer';
import { esTemplate } from './estemplate';
import type {
    AssignmentExpression,
    Function as EsFunction, // Renamed to avoid confusion with the JS built-in
    FunctionDeclaration,
    FunctionExpression,
    Node,
    ReturnStatement,
    VariableDeclaration,
} from 'estree';
import type { Program as EsProgram } from 'estree';
import type { Node as EstreeToolkitNode } from 'estree-toolkit/dist/helpers';

export type TransmogrificationMode = 'sync' | 'async';

interface TransmogrificationState {
    mode: TransmogrificationMode;
}

export type Visitors = Parameters<typeof traverse<Node, TransmogrificationState, never>>[1];

/** Function names that may be transmogrified. All should start with `__lwc`. */
// Rollup may rename variables to prevent shadowing. When it does, it uses the format `foo$0`, `foo$1`, etc.
const TRANSMOGRIFY_TARGET = /^__lwc(Generate|Tmpl).*$/;

type NonArrowFunction = FunctionDeclaration | FunctionExpression;
const isNonArrowFunction = (
    node: NodePath
): node is NodePath<FunctionDeclaration | FunctionExpression> => {
    return is.functionDeclaration(node) || is.functionExpression(node);
};

/**
 * Determines whether a node is a function we want to transmogrify or within one, at any level.
 */
const isWithinTargetFunc = (nodePath: NodePath): boolean => {
    let path: NodePath<NonArrowFunction> | null = isNonArrowFunction(nodePath)
        ? nodePath
        : nodePath.findParent<NonArrowFunction>(isNonArrowFunction);
    while (path?.node) {
        const { id } = path.node;
        if (id && TRANSMOGRIFY_TARGET.test(id.name)) {
            return true;
        }
        path = path.findParent<NonArrowFunction>(isNonArrowFunction);
    }
    return false;
};

/**
 * Determines whether the nearest function encapsulating this node is a function we transmogrify.
 */
const isImmediateWithinTargetFunc = (nodePath: NodePath): boolean => {
    const parentFunc = nodePath.findParent<EsFunction>(is.function);
    return Boolean(
        parentFunc &&
        isNonArrowFunction(parentFunc) &&
        parentFunc.node?.id &&
        TRANSMOGRIFY_TARGET.test(parentFunc.node.id.name)
    );
};

const bDeclareYieldVar = esTemplate`let __lwcYield = '';`<VariableDeclaration>;
const bAppendToYieldVar = esTemplate`__lwcYield += ${is.expression};`<AssignmentExpression>;
const bReturnYieldVar = esTemplate`return __lwcYield;`<ReturnStatement>;

const visitors: Visitors = {
    // @ts-expect-error types for `traverse` do not support sharing a visitor between node types:
    // https://github.com/sarsamurmu/estree-toolkit/issues/20
    'FunctionDeclaration|FunctionExpression'(
        path: NodePath<FunctionDeclaration | FunctionExpression, EstreeToolkitNode>,
        state: TransmogrificationState
    ) {
        const { node } = path;
        if (!node?.async || !node?.generator) {
            return;
        }

        // Component authors might conceivably use async generator functions in their own code. Therefore,
        // when traversing & transforming written+generated code, we need to disambiguate generated async
        // generator functions from those that were written by the component author.
        if (!isWithinTargetFunc(path)) {
            return;
        }
        node.generator = false;
        node.async = state.mode === 'async';
        node.body.body = [bDeclareYieldVar(), ...node.body.body, bReturnYieldVar()];
    },
    YieldExpression(path, state) {
        const { node } = path;
        if (!node) {
            return;
        }

        // Component authors might conceivably use generator functions within their own code. Therefore,
        // when traversing & transforming written+generated code, we need to disambiguate generated yield
        // expressions from those that were written by the component author.
        if (!isWithinTargetFunc(path)) {
            return;
        }

        const arg = node.argument;
        if (!arg) {
            const type = node.delegate ? 'yield*' : 'yield';
            throw new Error(`Cannot transmogrify ${type} statement without an argument.`);
        }

        path.replaceWith(bAppendToYieldVar(state.mode === 'sync' ? arg : b.awaitExpression(arg)));
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
    ReturnStatement(path) {
        if (!isImmediateWithinTargetFunc(path)) {
            return;
        }
        // The transmogrify result returns __lwcYield, so we skip it
        const arg = path.node?.argument;
        if (is.identifier(arg) && arg.name === '__lwcYield') {
            return;
        }
        throw new Error('Cannot transmogrify function with return statement.');
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
 *   async function* __lwcTmpl(props, attrs, slottedContent, Cmp, instance) {
 *       yield '<div>foobar</div>';
 *       const childProps = {};
 *       const childAttrs = {};
 *       yield* generateChildMarkup("x-child", childProps, childAttrs, childSlottedContentGenerator);
 *   }
 *
 * When transmogrified in async-mode, the above generated template function becomes the following:
 *
 *   async function __lwcTmpl($$emit, props, attrs, slottedContent, Cmp, instance) {
 *       $$emit('<div>foobar</div>');
 *       const childProps = {};
 *       const childAttrs = {};
 *       await generateChildMarkup($$emit, "x-child", childProps, childAttrs, childSlottedContentGenerator);
 *   }
 *
 * When transmogrified in sync-mode, the template function becomes the following:
 *
 *   function __lwcTmpl($$emit, props, attrs, slottedContent, Cmp, instance) {
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
