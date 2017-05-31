import * as types from 'babel-types';
import traverse from 'babel-traverse';

import {
    TEMPLATE_PARAMS,
} from './constants';

import {
    isComponentProp,
} from '../shared/ir';

import {
    IRNode,
    TemplateExpression,
} from '../shared/types';

const bindExpression = (identifier: string) => (expression: types.Expression) => (
    types.memberExpression(
        types.identifier(identifier),
        expression,
    )
);

const bindToComponent = bindExpression(TEMPLATE_PARAMS.INSTANCE);

export function applyExpressionBinding(expression: TemplateExpression, node: IRNode): TemplateExpression {
    // Wrapper is useful when the expression is a single identifier
    const wrapper = types.expressionStatement(expression);

    let isVisited = false;
    traverse(wrapper, {
        noScope: true,
        Identifier: {
            exit(path) {
                // Should run the exit visitor only once.
                if (isVisited) {
                    return;
                }
                isVisited = true;

                const identifier = path.node as types.Identifier;
                if (isComponentProp(identifier, node)) {
                    path.replaceWith(bindToComponent(identifier));
                }
            },
        },
    });

    return wrapper.expression as TemplateExpression;
}
