import traverse from 'babel-traverse';
import * as types from 'babel-types';
import * as babylon from 'babylon';

import {
    TemplateExpression,
    TemplateIdentifier,
} from '../shared/types';

export const EXPRESSION_SYMBOL_START = '{';
export const EXPRESSION_SYMBOL_END = '}';

const VALID_EXPRESSION_RE = /^{.+}$/;
const POTENTIAL_EXPRESSION_RE = /^.?{.+}.*$/;

export function isExpression(source: string): boolean {
    return !!source.match(VALID_EXPRESSION_RE);
}

export function isPotentialExpression(source: string): boolean {
    return !!source.match(POTENTIAL_EXPRESSION_RE);
}

// FIXME: Avoid throwing errors and return it properly
export function parseExpression(source: string): TemplateExpression {
    try {
        const parsed = babylon.parse(source);

        let expression;

        traverse(parsed, {
            enter(path) {
                const isValidNode = path.isProgram() || path.isBlockStatement() || path.isExpressionStatement() ||
                                    path.isLiteral() || path.isIdentifier() || path.isMemberExpression();
                if (!isValidNode) {
                    throw new Error(`Template expression doens't allow ${path.type}`);
                }

                // Ensure expression doesn't contain multiple expressions: {foo;bar}
                const hasMutipleExpressions = path.isBlock() && (path.get('body') as any).length !== 1;
                if (hasMutipleExpressions) {
                    throw new Error(`Multiple expressions found`);
                }

                // Retrieve the first expression and set it as return value
                if (path.isExpressionStatement() && !expression) {
                    expression = (path.node as types.ExpressionStatement).expression;
                }
            },
        });

        return expression;
    } catch (err) {
        err.message = `Invalid expression ${source} - ${err.message}`;
        throw err;
    }
}

export function getRootIdentifier(epxression: types.Expression): types.Identifier {
    let identifier: any;

    // Wrapper is useful when the expression is a single identifier
    const wrapper = types.expressionStatement(epxression);

    let isVisited = false;
    traverse(wrapper, {
        noScope: true,
        Identifier(path) {
            // Should run the visitor only once
            if (isVisited) {
                return;
            }
            isVisited = true;

            identifier = path.node;
        },
    });

    return identifier;
}

export function parseIdentifier(source: string): TemplateIdentifier {
    // FIXME: make sure the source is a valid identifier
    return types.identifier(source);
}
