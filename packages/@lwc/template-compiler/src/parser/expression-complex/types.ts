/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Node as AcornNode } from 'acorn';
import type { Tokenizer } from 'parse5';
import type { ComplexExpression } from '../../shared/types';

export type PreparsedExpressionMap = Map<
    number,
    { acornNode: AcornNode; estreeNode: ComplexExpression; rawText: string }
>;

export type Preprocessor = Omit<Tokenizer['preprocessor'], 'pos'> & {
    pos: number;
    advance: () => void;
};
