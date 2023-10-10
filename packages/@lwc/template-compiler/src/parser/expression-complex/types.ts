/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Node as AcornNode } from 'acorn';
import type { Preprocessor as Parse5Preprocessor } from '../../shared/parse5';

export type PreparsedExpressionMap = Map<number, AcornNode>;

export type Preprocessor = Omit<Parse5Preprocessor, 'pos'> & {
    pos: number;
    advance: () => void;
};
