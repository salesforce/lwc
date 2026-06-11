/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { entries } from '@lwc/shared';
import type { Checker } from 'estree-toolkit/dist/generated/is-type';
import type { Node } from 'estree-toolkit/dist/helpers'; // estree's `Node` is not compatible?

/** A validator that returns `true` if the node is `null`. */
type NullableChecker<T extends Node> = (node: Node | null | undefined) => node is T | null;

/** Extends a validator to return `true` if the node is `null`. */
export function isNullableOf<T extends Node>(validator: Checker<T>): NullableChecker<T> {
    const nullableValidator = (node: Node | null | undefined): node is T | null => {
        return node === null || validator(node);
    };
    if (process.env.NODE_ENV !== 'production') {
        nullableValidator.__debugName = `nullable(${(validator as any).__debugName || validator.name || 'unknown validator'})`;
    }
    return nullableValidator;
}

isNullableOf.__debugName = 'isNullableOf';

if (process.env.NODE_ENV !== 'production') {
    // Modifying another package's exports is a code smell!
    for (const [key, val] of entries(is)) {
        (val as any).__debugName = key;
    }
}
