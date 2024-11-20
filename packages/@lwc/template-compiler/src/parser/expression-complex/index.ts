/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { APIFeature, isAPIFeatureEnabled } from '@lwc/shared';
import type ParserCtx from '../parser';

export * from './types';
export * from './validate';
export * from './html';

export function isComplexTemplateExpressionEnabled(ctx: ParserCtx) {
    return (
        ctx.config.experimentalComplexExpressions &&
        isAPIFeatureEnabled(APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS, ctx.apiVersion)
    );
}
