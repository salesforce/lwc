/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as esutils from 'esutils';
import { Node, parseExpressionAt } from 'acorn';
import { ParserDiagnostics, invariant, generateCompilerError } from '@lwc/errors';

import * as t from '../shared/estree';
import { TemplateExpression, TemplateIdentifier, IRElement } from '../shared/types';

import { ResolvedConfig } from '../config';

export const EXPRESSION_SYMBOL_START = '{';
export const EXPRESSION_SYMBOL_END = '}';

const VALID_EXPRESSION_RE = /^{.+}$/;
const POTENTIAL_EXPRESSION_RE = /^.?{.+}.*$/;
const WHITESPACES_RE = /\s/;

export function isExpression(source: string): boolean {
    return !!source.match(VALID_EXPRESSION_RE);
}

export function isPotentialExpression(source: string): boolean {
    return !!source.match(POTENTIAL_EXPRESSION_RE);
}

function validateExpression(
    node: t.BaseNode,
    config: ResolvedConfig
): asserts node is TemplateExpression {
    const isValidNode = t.isIdentifier(node) || t.isMemberExpression(node);
    invariant(isValidNode, ParserDiagnostics.INVALID_NODE, [node.type]);

    if (t.isMemberExpression(node)) {
        invariant(
            config.experimentalComputedMemberExpression || !node.computed,
            ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED
        );

        const { object, property } = node;

        if (!t.isIdentifier(object)) {
            validateExpression(object, config);
        }

        if (!t.isIdentifier(property)) {
            validateExpression(property, config);
        }
    }
}

function validateSourceIsParsedExpression(source: string, parsedExpression: Node) {
    if (parsedExpression.end === source.length - 1) {
        return;
    }

    let unclosedParenthesisCount = 0;

    for (let i = 0, n = parsedExpression.start; i < n; i++) {
        if (source[i] === '(') {
            unclosedParenthesisCount++;
        }
    }

    // source[source.length - 1] === '}', n = source.length - 1 is to avoid processing '}'.
    for (let i = parsedExpression.end, n = source.length - 1; i < n; i++) {
        const character = source[i];

        if (character === ')') {
            unclosedParenthesisCount--;
        } else if (character === ';') {
            // acorn parseExpressionAt will stop at the first ";", it may be that the expression is not
            // a multiple expression ({foo;}), but this is a case that we explicitly do not want to support.
            // in such case, let's fail with the same error as if it were a multiple expression.
            invariant(false, ParserDiagnostics.MULTIPLE_EXPRESSIONS);
        } else {
            invariant(
                WHITESPACES_RE.test(character),
                ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                ['Unexpected end of expression']
            );
        }
    }

    invariant(unclosedParenthesisCount === 0, ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR, [
        'Unexpected end of expression',
    ]);
}

export function parseExpression(source: string, config: ResolvedConfig): TemplateExpression {
    try {
        const parsed = parseExpressionAt(source, 1, { ecmaVersion: 2020 });

        validateSourceIsParsedExpression(source, parsed);
        validateExpression(parsed, config);

        return parsed;
    } catch (err) {
        err.message = `Invalid expression ${source} - ${err.message}`;
        throw err;
    }
}

export function parseIdentifier(source: string): TemplateIdentifier | never {
    if (esutils.keyword.isIdentifierES6(source)) {
        return t.identifier(source);
    } else {
        throw generateCompilerError(ParserDiagnostics.INVALID_IDENTIFIER, {
            messageArgs: [source],
        });
    }
}

// Returns the immediate iterator parent if it exists.
// Traverses up until it finds an element with forOf, or
// a non-template element without a forOf.
export function getForOfParent(parentStack: IRElement[]): IRElement | null {
    let size = parentStack.length;
    let parent: IRElement | undefined = parentStack[--size];

    while (parent) {
        if (parent.forOf) {
            return parent;
        }

        parent = parent.tag === 'template' ? parentStack[--size] : undefined;
    }

    return null;
}

export function getForEachParent(element: IRElement, parentStack: IRElement[]): IRElement | null {
    let current: IRElement | undefined = element;
    let size = parentStack.length;

    while (current) {
        if (current.forEach) {
            return current;
        }

        const parent = parentStack[--size];
        current = parent?.tag === 'template' ? parent : undefined;
    }

    return null;
}

export function isIteratorElement(element: IRElement, parentStack: IRElement[]): boolean {
    return !!(getForOfParent(parentStack) || getForEachParent(element, parentStack));
}
