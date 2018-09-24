import traverse from 'babel-traverse';
import * as types from 'babel-types';
import * as babylon from 'babylon';
import * as esutils from 'esutils';

import State from '../state';

import {
    TemplateExpression,
    TemplateIdentifier,
    IRNode,
    IRElement,
} from '../shared/types';

import {
    isBoundToIterator,
} from '../shared/ir';

export const EXPRESSION_SYMBOL_START = '{';
export const EXPRESSION_SYMBOL_END = '}';

const VALID_EXPRESSION_RE = /^{.+}$/;
const POTENTIAL_EXPRESSION_RE = /^.?{.+}.*$/;

const ITERATOR_NEXT_KEY = 'next';

export function isExpression(source: string): boolean {
    return !!source.match(VALID_EXPRESSION_RE);
}

export function isPotentialExpression(source: string): boolean {
    return !!source.match(POTENTIAL_EXPRESSION_RE);
}

// FIXME: Avoid throwing errors and return it properly
export function parseExpression(source: string, element: IRNode, state: State): TemplateExpression {
    try {
        const parsed = babylon.parse(source);

        let expression: any;

        traverse(parsed, {
            enter(path) {
                const isValidNode = path.isProgram() || path.isBlockStatement() || path.isExpressionStatement() ||
                                    path.isIdentifier() || path.isMemberExpression();
                if (!isValidNode) {
                    throw new Error(`Template expression doesn't allow ${path.type}`);
                }

                // Ensure expression doesn't contain multiple expressions: {foo;bar}
                const hasMultipleExpressions = path.isBlock() && (path.get('body') as any).length !== 1;
                if (hasMultipleExpressions) {
                    throw new Error(`Multiple expressions found`);
                }

                // Retrieve the first expression and set it as return value
                if (path.isExpressionStatement() && !expression) {
                    expression = (path.node as types.ExpressionStatement).expression;
                }
            },

            MemberExpression: {
                exit(path) {
                    const shouldReportComputed = !state.config.computedMemberExpression
                        && (path.node as types.MemberExpression).computed;

                    if (shouldReportComputed) {
                        throw new Error(`Template expression doesn't allow computed property access`);
                    }

                    const memberExpression = path.node as types.MemberExpression;
                    const propertyIdentifier = memberExpression.property as TemplateIdentifier;
                    const objectIdentifier = memberExpression.object as TemplateIdentifier;
                    if (isBoundToIterator(objectIdentifier, element) && propertyIdentifier.name === ITERATOR_NEXT_KEY) {
                        throw new Error(`Template expression doesn't allow to modify iterators`);
                    }
                },
            },
        });

        return expression;
    } catch (err) {
        err.message = `Invalid expression ${source} - ${err.message}`;
        throw err;
    }
}

export function parseIdentifier(source: string): TemplateIdentifier {
    if (esutils.keyword.isIdentifierES6(source)) {
        return types.identifier(source);
    } else {
        throw new Error(`Invalid identifier`);
    }
}

// Returns the immediate iterator parent if it exists.
// Traverses up until it finds an element with forOf, or
// a non-template element without a forOf.
export function getForOfParent(element: IRElement): IRElement | null {
    const parent = element.parent;
    if (!parent) {
        return null;
    }

    if (parent.forOf) {
        return parent;
    } else if (parent.tag.toLowerCase() === 'template') {
        return getForOfParent(parent);
    }
    return null;
}

export function getForEachParent(element: IRElement): IRElement | null {
    if (element.forEach) {
        return element;
    }

    const parent = element.parent;
    if (parent && parent.tag.toLowerCase() === 'template') {
        return getForEachParent(parent);
    }

    return null;
}

export function isIteratorElement(element: IRElement): boolean {
    return !!(getForOfParent(element) || getForEachParent(element));
}
