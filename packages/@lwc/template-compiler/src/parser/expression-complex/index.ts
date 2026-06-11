/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { APIFeature, isAPIFeatureEnabled } from '@lwc/shared';
import { parseExpressionAt } from 'acorn';
import { invariant, ParserDiagnostics } from '@lwc/errors';
import { OPENING_CURLY_LEN, validateComplexExpression } from './validate';
import type ParserCtx from '../parser';
import type { Expression, SourceLocation } from '../../shared/types';

export * from './types';
export * from './validate';

export function isComplexTemplateExpressionEnabled(ctx: ParserCtx) {
    return (
        ctx.config.experimentalComplexExpressions &&
        isAPIFeatureEnabled(APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS, ctx.apiVersion)
    );
}

export function parseComplexExpression(
    ctx: ParserCtx,
    source: string,
    templateSource: string,
    location: SourceLocation,
    expressionStart: number = 0
): {
    expression: Expression;
    raw: string;
} {
    const { ecmaVersion } = ctx;
    return ctx.withErrorWrapping(
        () => {
            const options = {
                ecmaVersion,
                onComment: () =>
                    invariant(false, ParserDiagnostics.INVALID_EXPR_COMMENTS_DISALLOWED),
                allowAwaitOutsideFunction: true,
            };

            const estreeNode = parseExpressionAt(
                source,
                expressionStart + OPENING_CURLY_LEN,
                options
            );

            return validateComplexExpression(
                estreeNode,
                source,
                templateSource,
                expressionStart,
                options,
                location
            );
        },
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        location,
        (err) => `Invalid expression ${source} - ${err.message}`
    );
}
