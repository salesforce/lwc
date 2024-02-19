/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import compileJS from './compile-js';
import compileTemplate from './compile-template';

export interface JsTransformOptions {
    name: string;
    namespace: string;
}
export interface TemplateTransformOptions {
    enableDynamicComponents?: boolean;
}

export interface CompilationResult {
    code: string;
    map: unknown;
}

export function compileComponentForSSR(
    src: string,
    filename: string,
    options: JsTransformOptions
): CompilationResult {
    const { code } = compileJS(src, filename, options);
    return { code, map: undefined };
}

export function compileTemplateForSSR(
    src: string,
    filename: string,
    { enableDynamicComponents }: TemplateTransformOptions
): CompilationResult {
    const { code } = compileTemplate(src, filename, { enableDynamicComponents });
    return { code, map: undefined };
}
