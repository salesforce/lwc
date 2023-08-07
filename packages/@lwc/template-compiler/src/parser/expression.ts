/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Node, parseExpressionAt, isIdentifierStart, isIdentifierChar } from 'acorn';
import { ParserDiagnostics, invariant } from '@lwc/errors';

import * as t from '../shared/estree';
import { NormalizedConfig } from '../config';
import { Expression, Identifier, SourceLocation } from '../shared/types';
import { validateExpressionAst } from './expression-complex';

import ParserCtx from './parser';
import { isReservedES6Keyword } from './utils/javascript';

export const EXPRESSION_SYMBOL_START = '{';
export const EXPRESSION_SYMBOL_END = '}';

const POTENTIAL_EXPRESSION_RE = /^.?{.+}.*$/;
const WHITESPACES_RE = /\s/;

export function isExpression(source: string): boolean {
    // Issue #3418: Legacy behavior, previous regex treated "{}" attribute value as non expression
    return source[0] === '{' && source.slice(-1) === '}' && source.length > 2;
}

export function isPotentialExpression(source: string): boolean {
    return !!source.match(POTENTIAL_EXPRESSION_RE);
}

function validateExpression(
    node: t.BaseNode,
    config: NormalizedConfig
): asserts node is Expression {
    // TODO [#3370]: remove experimental template expression flag
    if (config.experimentalComplexExpressions) {
        return validateExpressionAst(node);
    }

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

export function parseExpression(
    ctx: ParserCtx,
    source: string,
    location: SourceLocation
): Expression {
    const { ecmaVersion } = ctx;
    return ctx.withErrorWrapping(
        () => {
            const parsed = parseExpressionAt(source, 1, {
                ecmaVersion,
                // TODO [#3370]: remove experimental template expression flag
                allowAwaitOutsideFunction: ctx.config.experimentalComplexExpressions,
            });

            validateSourceIsParsedExpression(source, parsed);
            validateExpression(parsed, ctx.config);

            return { ...parsed, location };
        },
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        location,
        (err) => `Invalid expression ${source} - ${err.message}`
    );
}

export function parseIdentifier(
    ctx: ParserCtx,
    source: string,
    location: SourceLocation
): Identifier {
    let isValid = true;

    isValid = isIdentifierStart(source.charCodeAt(0));
    for (let i = 1; i < source.length && isValid; i++) {
        isValid = isIdentifierChar(source.charCodeAt(i));
    }

    if (isValid && !isReservedES6Keyword(source)) {
        return {
            ...t.identifier(source),
            location,
        };
    } else {
        ctx.throwAtLocation(ParserDiagnostics.INVALID_IDENTIFIER, location, [source]);
    }
}
