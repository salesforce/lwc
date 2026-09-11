/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { generateScopeTokens } from '@lwc/template-compiler';
import { transform } from './transform';
import { generate } from './codegen/generate';

export interface VaporCompileResult {
    code: string;
    warnings: string[];
}

export interface VaporCompileOptions {
    namespace?: string;
    name?: string;
    filename?: string;
    /** Enable complex template expressions (CTE): a QUOTED attribute value that is a
     *  single `{expr}` is parsed as a dynamic binding (`foo="{bar()}"`). */
    experimentalComplexExpressions?: boolean;
}

export function compileVapor(
    source: string,
    options: VaporCompileOptions = {}
): VaporCompileResult {
    const warnings: string[] = [];

    // Compute the CSS scope token the same way the standard compiler does, so
    // scoped styles and synthetic-shadow tokens match engine-core semantics.
    const filename = options.filename ?? `${options.name ?? 'cmp'}.js`;
    const { scopeToken, legacyScopeToken } = generateScopeTokens(
        filename,
        options.namespace,
        options.name
    );

    // Step 1: Parse the LWC template HTML into IR
    const ir = transform(source, options, warnings);

    // Step 2: Generate JavaScript from IR
    const code = generate(ir, { ...options, scopeToken, legacyScopeToken });

    return { code, warnings };
}
