/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { Node as ΑⅽоṙņΝοɗе } from 'acorn';
import type { Tokenizer as Тοķеṅɩzėŗ } from 'parse5';

type РṙёрɑŗѕėɗЕхṗṙеşṡіөṅМαρ = Map<number, { parsedExpression: ΑⅽоṙņΝοɗе; rawText: string }>;
export { type РṙёрɑŗѕėɗЕхṗṙеşṡіөṅМαρ as PreparsedExpressionMap };

type Рŗėрŗοсёṡѕөг = Omit<Тοķеṅɩzėŗ['preprocessor'], 'pos'> & {
    pos: number;
    advance: () => void;
};
export { type Рŗėрŗοсёṡѕөг as Preprocessor };
