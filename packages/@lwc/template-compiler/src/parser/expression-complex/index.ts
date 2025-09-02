/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { APIFeature, isAPIFeatureEnabled } from '@lwc/shared';
import { parseExpressionAt, type Expression } from 'acorn';
import { invariant, ParserDiagnostics } from '@lwc/errors';
import { EXPRESSION_SYMBOL_END } from '../expression';
import { validateExpressionAst } from './validate';
import type ParserCtx from '../parser';
import type { SourceLocation } from '../../shared/types';

export * from './types';
export * from './validate';
export * from './html';

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
    position: number = 1,
    location: SourceLocation
): Expression | null {
    const { ecmaVersion } = ctx;
    return ctx.withErrorWrapping(
        () => {
            debugger;
            const expression = parseExpressionAt(source, position, {
                ecmaVersion,
                allowAwaitOutsideFunction: true,            
                onComment: () => invariant(false, ParserDiagnostics.INVALID_EXPR_COMMENTS_DISALLOWED),
            });

            let templateExpression;

            // The expression terminated incorrectly, but the extended expression was, indicating a parsing error.
            invariant(expressionTerminator === EXPRESSION_SYMBOL_END || templateExpressionTerminator !== EXPRESSION_SYMBOL_END, ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR, [
                'Unexpected end of expression'
            ]);

            /*
                This second parsing is for comparison purposes. If it throws we need to understand why 
            */
            try {
                templateExpression = parseExpressionAt(templateSource, position, {
                    ecmaVersion,
                    allowAwaitOutsideFunction: true,            
                    onComment: () => invariant(false, ParserDiagnostics.INVALID_EXPR_COMMENTS_DISALLOWED),
                });
            } catch {
                // If parsing the full template failed, the expression was not correctly formed
                return null;
            }

            const expressionTerminator = source[expression.end];
            const templateExpressionTerminator = templateSource[templateExpression.end];
                
            

            // The expression did not match the extended expression, indicating a parsing error.
            invariant(expression.end === templateExpression.end, ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR, [
                'Expression incorrectly formed'
            ]);

            // The expression was not terminated correctly, this is not an expression.
            if (expressionTerminator !== EXPRESSION_SYMBOL_END) {
                return null;
            }

            validateExpressionAst(expression);

            return expression;
        },
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        location,
        (err) => `Invalid expression ${source} - ${err.message}`
    );
}
