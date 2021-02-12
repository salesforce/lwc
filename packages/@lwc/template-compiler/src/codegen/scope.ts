/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as types from '@babel/types';
import traverse from '@babel/traverse';

import { TEMPLATE_PARAMS } from '../shared/constants';
import { isComponentProp } from '../shared/ir';
import { IRNode, TemplateExpression } from '../shared/types';

/**
 * Bind the passed expression to the component instance. It applies the following transformation to the expression:
 * - {value} --> {$cmp.value}
 * - {value[state.index]} --> {$cmp.value[$cmp.index]}
 */
export function bindExpression(
    expression: TemplateExpression,
    node: IRNode,
    applyBinding: boolean = true
): TemplateExpression {
    const wrappedExpression = types.expressionStatement(expression);

    traverse(wrappedExpression, {
        noScope: true,
        Identifier(path) {
            const identifierNode = path.node;
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
            }
        },
    });

    return wrappedExpression.expression as TemplateExpression;
}
