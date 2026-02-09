/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postCssSelectorParser from 'postcss-selector-parser';
import type { Node, Pseudo } from 'postcss-selector-parser';

export function isDirPseudoClass(node: Node): node is Pseudo {
    return postCssSelectorParser.isPseudoClass(node) && node.value === ':dir';
}
