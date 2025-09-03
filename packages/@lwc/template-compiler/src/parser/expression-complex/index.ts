/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { APIFeature, isAPIFeatureEnabled } from '@lwc/shared';
import { parseExpressionAt } from 'acorn';
import { invariant, ParserDiagnostics } from '@lwc/errors';
import { EXPRESSION_SYMBOL_END } from '../expression';
import { validateExpressionAst } from './validate';
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
            };
            const expression = parseExpressionAt(source, expressionStart + 1, options);

            const expressionTerminator = source[expression.end];
            invariant(
                expressionTerminator === EXPRESSION_SYMBOL_END,
                ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                ['expression must end with curly brace.']
            );

            /*
                This second parsing is for comparison purposes.
                <span>{call("}<c-status></c-status>")}</span>
            */
            const templateExpression = parseExpressionAt(
                templateSource,
                expressionStart + 1,
                options
            );
            invariant(
                expression.end === templateExpression.end,
                ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
                ['Expression incorrectly formed']
            );

            validateExpressionAst(expression);

            return {
                expression: { ...expression, location },
                raw: source.slice(expressionStart, expression.end + 1),
            };
        },
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        location,
        (err) => `Invalid expression ${source} - ${err.message}`
    );
}
