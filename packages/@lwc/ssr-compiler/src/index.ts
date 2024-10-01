/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import compileJS from './compile-js';
import compileTemplate from './compile-template';
import { TransformOptions } from './shared';

export interface CompilationResult {
    code: string;
    map: unknown;
}

export function compileComponentForSSR(
    src: string,
    filename: string,
    _options: TransformOptions
): CompilationResult {
    const { code } = compileJS(src, filename);
    return { code, map: undefined };
}

export function compileTemplateForSSR(
    src: string,
    filename: string,
    options: TransformOptions
): CompilationResult {
    const { code } = compileTemplate(src, filename, options);
    return { code, map: undefined };
}
