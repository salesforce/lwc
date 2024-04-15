/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Expression, Options } from 'acorn';

// Acorn shipped a breaking change in its types: https://github.com/acornjs/acorn/issues/1260
// This is a workaround based on Svelte's solution: https://github.com/sveltejs/svelte/pull/10301
declare module 'acorn' {
    export function isIdentifierStart(code: number, astral?: boolean): boolean;
    export function isIdentifierChar(code: number, astral?: boolean): boolean;
    export function parseExpressionAt(input: string, pos: number, options: Options): Expression;
}
