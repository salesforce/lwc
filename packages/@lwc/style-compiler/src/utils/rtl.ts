/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isPseudoClass, Node, Pseudo } from 'postcss-selector-parser';

export function isDirPseudoClass(node: Node): node is Pseudo {
    return isPseudoClass(node) && node.value === ':dir';
}
