/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// This is an internal module from postcss-selector-parser, so it doesn't have any types.
declare module 'postcss-selector-parser/dist/parser' {
    export default class SelectorParser {
        constructor(data: string);
        tokens: number[][];
    }
}
