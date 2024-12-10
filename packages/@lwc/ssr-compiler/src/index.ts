/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { DEFAULT_SSR_MODE, type CompilationMode, generateCustomElementTagName } from '@lwc/shared';
import compileJS from './compile-js';
import compileTemplate from './compile-template';
import type { TransformOptions } from './shared';

export interface CompilationResult {
    code: string;
    map: unknown;
}

export function compileComponentForSSR(
    src: string,
    filename: string,
    options: TransformOptions,
    mode: CompilationMode = DEFAULT_SSR_MODE
): CompilationResult {
    const tagName = generateCustomElementTagName(options.namespace, options.name);
    const { code } = compileJS(src, filename, tagName, mode);
    return { code, map: undefined };
}

export function compileTemplateForSSR(
    src: string,
    filename: string,
    options: TransformOptions,
    mode: CompilationMode = DEFAULT_SSR_MODE
): CompilationResult {
    const { code } = compileTemplate(src, filename, options, mode);
    return { code, map: undefined };
}
