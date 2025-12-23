/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { parseExpressionAt, isIdentifierStart, isIdentifierChar } from 'acorn';
import { ParserDiagnostics, invariant } from '@lwc/errors';

import { APIFeature, minApiVersion } from '@lwc/shared';
import * as t from '../shared/estree';
import { isReservedES6Keyword } from './utils/javascript';
import { isComplexTemplateExpressionEnabled } from './expression-complex';
import type { Expression, Identifier, SourceLocation } from '../shared/types';

import type ParserCtx from './parser';
import type { Node } from 'acorn';

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

const minCteApiVersion = minApiVersion(APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS);

function validateExpression(
    source: string,
    node: t.BaseNode,
    ctx: ParserCtx,
    unquotedAttributeExpression: boolean
): asserts node is Expression {
    const cteOnlyNode = !t.isIdentifier(node) && !t.isMemberExpression(node);

    // If this node is not an identifier or a member expression (the only two nodes allowed if complexTemplateExpressions are disabled),
    // then we throw if the following invariants do not hold true.
    if (cteOnlyNode) {
        // complexTemplateExpressions must be enabled if this is a cteOnlyNode.
        invariant(ctx.config.experimentalComplexExpressions, ParserDiagnostics.INVALID_NODE, [
            node.type,
        ]);
        // complexTemplateExpressions must be enabled and the component API version must be sufficient.
        invariant(
            isComplexTemplateExpressionEnabled(ctx),
            ParserDiagnostics.INVALID_NODE_CTE_API_VERSION,
            [node.type, ctx.apiVersion, minCteApiVersion]
        );
        // complexTemplateExpressions must be enabled, the component API version must be sufficient and the expression should not be
        // an unquoted attribute expression.
        invariant(
            isComplexTemplateExpressionEnabled(ctx) && !unquotedAttributeExpression,
            ParserDiagnostics.INVALID_NODE_CTE_UNQUOTED,
            [node.type, source]
        );
    }

    if (t.isMemberExpression(node)) {
        // If this is a computed node and experimentalComputedMemberExpressions is not enabled,
        // then we throw if the following invariants do not hold true.
        if (!ctx.config.experimentalComputedMemberExpression && node.computed) {
            // complexTemplateExpressions must be enabled.
            invariant(
                ctx.config.experimentalComplexExpressions,
                ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED,
                [source]
            );
            // complexTemplateExpressions must be enabled and the component API version must be sufficient.
            invariant(
                isComplexTemplateExpressionEnabled(ctx),
                ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED_CTE_API_VERSION,
                [source, ctx.apiVersion, minCteApiVersion]
            );
            // complexTemplateExpressions must be enabled, the component API version must be sufficient and the expression
            // should not be an unquoted attribute expression.
            invariant(
                isComplexTemplateExpressionEnabled(ctx) && !unquotedAttributeExpression,
                ParserDiagnostics.COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED_CTE_UNQUOTED,
                [source]
            );
        }

        const { object, property } = node;

        if (!t.isIdentifier(object)) {
            validateExpression(source, object, ctx, unquotedAttributeExpression);
        }

        if (!t.isIdentifier(property)) {
            validateExpression(source, property, ctx, unquotedAttributeExpression);
        }
    }
}

export function validateSourceIsParsedExpression(source: string, parsedExpression: Node) {
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
    location: SourceLocation,
    unquotedAttributeExpression: boolean
): Expression {
    const { ecmaVersion } = ctx;
    return ctx.withErrorWrapping(
        () => {
            const parsed = parseExpressionAt(source, 1, {
                ecmaVersion,
                allowAwaitOutsideFunction: false,
                onComment: () =>
                    invariant(false, ParserDiagnostics.INVALID_EXPR_COMMENTS_DISALLOWED),
            });

            validateSourceIsParsedExpression(source, parsed);
            validateExpression(source, parsed, ctx, unquotedAttributeExpression);

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

    if (isValid) {
        if (isReservedES6Keyword(source)) {
            ctx.throwAtLocation(ParserDiagnostics.RESERVED_KEYWORD_AS_IDENTIFIER, location, [
                source,
            ]);
        }
        return {
            ...t.identifier(source),
            location,
        };
    } else {
        ctx.throwAtLocation(ParserDiagnostics.INVALID_IDENTIFIER, location, [source]);
    }
}
