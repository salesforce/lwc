/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as types from '@babel/types';
import * as esutils from 'esutils';
import { Node, parseExpressionAt } from 'acorn';
import estree from 'estree';

import { ParserDiagnostics, invariant, generateCompilerError } from '@lwc/errors';

import State from '../state';

import { TemplateExpression, TemplateIdentifier, IRNode, IRElement } from '../shared/types';

import { isBoundToIterator } from '../shared/ir';

export const EXPRESSION_SYMBOL_START = '{';
export const EXPRESSION_SYMBOL_END = '}';

const VALID_EXPRESSION_RE = /^{.+}$/;
const POTENTIAL_EXPRESSION_RE = /^.?{.+}.*$/;
const WHITESPACES_RE = /\s/;

const ITERATOR_NEXT_KEY = 'next';

export function isExpression(source: string): boolean {
    return !!source.match(VALID_EXPRESSION_RE);
}

export function isPotentialExpression(source: string): boolean {
    return !!source.match(POTENTIAL_EXPRESSION_RE);
}

function isEsTreeIdentifier(node: estree.BaseNode): node is estree.Identifier {
    return node.type === 'Identifier';
}

function isEsTreeMemberExpression(node: estree.BaseNode): node is estree.MemberExpression {
    return node.type === 'MemberExpression';
}

function validateExpression(
    node: estree.BaseNode,
    element: IRNode,
    allowComputedMemberExpression: boolean
) {
    const isValidNode = isEsTreeIdentifier(node) || isEsTreeMemberExpression(node);
    invariant(isValidNode, ParserDiagnostics.INVALID_NODE, [node.type]);

    if (isEsTreeMemberExpression(node)) {
        invariant(
            allowComputedMemberExpression || !node.computed,
            ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED
        );

        const { object, property } = node;

        // Validate if the expression is modifying an iterator (only the leftmost). Ex: it.next in it.next.foo
        if (isEsTreeIdentifier(object) && isEsTreeIdentifier(property)) {
            invariant(
                property.name !== ITERATOR_NEXT_KEY ||
                    !isBoundToIterator((object as unknown) as TemplateIdentifier, element),
                ParserDiagnostics.MODIFYING_ITERATORS_NOT_ALLOWED
            );
        } else {
            validateExpression(object, element, allowComputedMemberExpression);
        }
    }
}

function validateSourceIsParsedExpression(source: string, parsedExpression: Node) {
    if (parsedExpression.end === source.length - 1) {
        return;
    }

    let leadingParenthesis = 0;
    let n = parsedExpression.start;
    let i;

    for (i = 0; i < n; i++) {
        if (source[i] === '(') {
            leadingParenthesis++;
        }
    }

    i = parsedExpression.end;
    n = source.length - 1;
    while (i < n) {
        const character = source[i];

        if (character === ')') {
            leadingParenthesis--;
        } else if (character === ';') {
            // A potential multiple expression: the rest of the string should be whitespaces.
            // Note: all expressions ends with "}", therefore this loop will stop.
            i++;
            while (WHITESPACES_RE.test(source[i])) i++;

            invariant(i === n && leadingParenthesis === 0, ParserDiagnostics.MULTIPLE_EXPRESSIONS);
        } else {
            invariant(
                WHITESPACES_RE.test(character),
                ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                ['Unexpected end of expression']
            );
        }

        i++;
    }
}

// FIXME: Avoid throwing errors and return it properly
export function parseExpression(source: string, element: IRNode, state: State): TemplateExpression {
    try {
        const parsed = parseExpressionAt(source, 1, { ecmaVersion: 2020 });

        validateSourceIsParsedExpression(source, parsed);
        validateExpression(parsed, element, state.config.experimentalComputedMemberExpression);

        return (parsed as unknown) as TemplateExpression;
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
