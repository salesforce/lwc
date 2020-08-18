/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as types from '@babel/types';
import * as esutils from 'esutils';
import { parse } from 'acorn';
import estree from 'estree';

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

function validateExpression(
    node: estree.BaseNode,
    element: IRNode,
    allowComputedMemberExpression: boolean
): node is estree.MemberExpression | estree.Identifier {
    const isValidNode = node.type === 'Identifier' || node.type === 'MemberExpression';
    invariant(isValidNode, ParserDiagnostics.INVALID_NODE, [node.type]);

    if (node.type === 'MemberExpression') {
        const expression = node as estree.MemberExpression;

        invariant(
            allowComputedMemberExpression || !expression.computed,
            ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED
        );

        // Validate if the expression is modifying an iterator (only the leftmost). Ex: it.next in it.next.foo
        if (expression.object.type === 'Identifier' && expression.property.type === 'Identifier') {
            // .object and .property are ensured to be Identifiers.
            const propertyIdentifier = (expression.property as unknown) as TemplateIdentifier;
            const objectIdentifier = (expression.object as unknown) as TemplateIdentifier;
            invariant(
                !isBoundToIterator(objectIdentifier, element) ||
                    propertyIdentifier.name !== ITERATOR_NEXT_KEY,
                ParserDiagnostics.MODIFYING_ITERATORS_NOT_ALLOWED
            );
        } else {
            validateExpression(expression.object, element, allowComputedMemberExpression);
        }
    }

    return true;
}

function getParsedExpression(ast: estree.Node, element: IRNode, state: State): TemplateExpression {
    const hasMultipleExpressions = ast.type === 'Program' && ast.body.length !== 1;
    invariant(!hasMultipleExpressions, ParserDiagnostics.MULTIPLE_EXPRESSIONS);

    const expressionStatement = (ast as estree.Program).body[0];
    invariant(expressionStatement.type === 'ExpressionStatement', ParserDiagnostics.INVALID_NODE, [
        expressionStatement.type,
    ]);

    const expression = (expressionStatement as estree.ExpressionStatement).expression;

    validateExpression(expression, element, state.config.experimentalComputedMemberExpression);

    return (expression as unknown) as TemplateExpression;
}

// FIXME: Avoid throwing errors and return it properly
export function parseExpression(source: string, element: IRNode, state: State): TemplateExpression {
    try {
        const parsed = parse(source.substr(1, source.length - 2), { ecmaVersion: 2020 });

        return getParsedExpression(parsed as estree.Node, element, state);
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
