/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import traverse from '@babel/traverse';
import * as types from '@babel/types';
import * as babylon from '@babel/parser';
import * as esutils from 'esutils';

import { ParserDiagnostics, invariant, generateCompilerError } from '@lwc/errors';

import State from '../state';

import { TemplateExpression, TemplateIdentifier, IRNode, IRElement } from '../shared/types';

import { isBoundToIterator } from '../shared/ir';

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
                const isValidNode =
                    path.isProgram() ||
                    path.isBlockStatement() ||
                    path.isExpressionStatement() ||
                    path.isIdentifier() ||
                    path.isMemberExpression();
                invariant(isValidNode, ParserDiagnostics.INVALID_NODE, [path.type]);

                // Ensure expression doesn't contain multiple expressions: {foo;bar}
                const hasMultipleExpressions =
                    path.isBlock() && (path.get('body') as any).length !== 1;
                invariant(!hasMultipleExpressions, ParserDiagnostics.MULTIPLE_EXPRESSIONS);

                // Retrieve the first expression and set it as return value
                if (path.isExpressionStatement() && !expression) {
                    expression = (path.node as types.ExpressionStatement).expression;
                }
            },

            MemberExpression: {
                exit(path) {
                    const shouldReportComputed =
                        !state.config.experimentalComputedMemberExpression &&
                        (path.node as types.MemberExpression).computed;
                    invariant(
                        !shouldReportComputed,
                        ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED
                    );

                    const memberExpression = path.node as types.MemberExpression;
                    const propertyIdentifier = memberExpression.property as TemplateIdentifier;
                    const objectIdentifier = memberExpression.object as TemplateIdentifier;
                    invariant(
                        !isBoundToIterator(objectIdentifier, element) ||
                            propertyIdentifier.name !== ITERATOR_NEXT_KEY,
                        ParserDiagnostics.MODIFYING_ITERATORS_NOT_ALLOWED
                    );
                },
            },
        });

        return expression;
    } catch (err) {
        err.message = `Invalid expression ${source} - ${err.message}`;
        throw err;
    }
}

export function parseIdentifier(source: string): TemplateIdentifier | never {
    if (esutils.keyword.isIdentifierES6(source)) {
        return types.identifier(source);
    } else {
        throw generateCompilerError(ParserDiagnostics.INVALID_IDENTIFIER, {
            messageArgs: [source],
        });
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
