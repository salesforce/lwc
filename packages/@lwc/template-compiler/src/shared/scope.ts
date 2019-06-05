/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as types from '@babel/types';
import traverse from '@babel/traverse';

import { TEMPLATE_PARAMS } from './constants';
import { isComponentProp } from './ir';
import { IRNode, TemplateExpression } from './types';

export interface BindingResult {
    expression: types.Expression;
    bounded: string[];
}

export interface MappedFunctionResult {
    expression: types.FunctionExpression;
    error?: string;
}

/**
 * Rewrite member expressions in function body that are referencing iterator.
 * - function (iteratorIndex) { iterator.index } -> function (iteratorIndex) { iteratorIndex }
 */
export function rewriteIteratorToArguments(
    expression: types.FunctionExpression,
    identifier: types.Identifier,
    argNames: { [key: string]: types.Identifier }
): MappedFunctionResult {
    traverse(expression, {
        noScope: true,
        MemberExpression(path) {
            const memberNode = path.node as types.MemberExpression;
            const memberObject = memberNode.object as types.Identifier;
            const memberProperty = memberNode.property as types.Identifier;
            const rewrite = memberObject.name === identifier.name;

            if (rewrite && argNames[memberProperty.name]) {
                path.replaceWith(argNames[memberProperty.name]);
            }
        },
    });

    return {
        expression,
    };
}

/**
 * Bind the passed expression to the component instance. It applies the following transformation to the expression:
 * - {value} --> {$cmp.value}
 * - {value[state.index]} --> {$cmp.value[$cmp.index]}
 */
export function bindExpression(
    expression: TemplateExpression,
    node: IRNode,
    applyBinding: boolean = true
): BindingResult {
    const wrappedExpression = types.expressionStatement(expression);
    const boundIdentifiers: Set<string> = new Set();

    traverse(wrappedExpression, {
        noScope: true,
        Identifier(path) {
            const identifierNode = path.node as types.Identifier;
            let shouldBind = false;

            if (types.isMemberExpression(path.parent)) {
                // If identifier is the 'object' of the member expression we can safely deduce,
                // the current identifier is the left most identifier of the expression
                shouldBind = path.parent.object === identifierNode;
            } else if (types.isExpressionStatement(path.parent)) {
                // In case the template expression is only composed of an identifier, we check
                // if the wrapper expression is the direct parent
                shouldBind = path.parent.expression === identifierNode;
            }

            // Checks if the identifier is a component property
            if (shouldBind && isComponentProp(identifierNode, node)) {
                // Need to skip children once bounded, because the replaceWith call will creates
                // an infinite loop
                path.skip();

                if (applyBinding) {
                    const boundedExpression = types.memberExpression(
                        types.identifier(TEMPLATE_PARAMS.INSTANCE),
                        identifierNode
                    );
                    path.replaceWith(boundedExpression);
                }

                // Save the bounded identifier
                boundIdentifiers.add(identifierNode.name);
            }
        },
    });

    return {
        expression: wrappedExpression.expression,
        bounded: Array.from(boundIdentifiers),
    };
}
