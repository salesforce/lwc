/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { BabelFileResult } from '@babel/core';
import type { CompilerDiagnostic } from '@lwc/errors';

/** The object returned after transforming code. */
export interface TransformResult {
    /** The compiled source code. */
    code: string;
    /** The generated source map. */
    map: BabelFileResult['map'];
    /** Any diagnostic warnings that may have occurred. */
    warnings?: CompilerDiagnostic[];
    /**
     * String tokens used for style scoping in synthetic shadow DOM and `*.scoped.css`, as either
     * attributes or classes.
     */
    cssScopeTokens?: string[];
}
