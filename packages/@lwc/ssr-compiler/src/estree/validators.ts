/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { entries } from '@lwc/shared';
import type { NodePath, types as t } from 'estree-toolkit'; // estree's `Node` is not compatible?

/** Unwraps a node or a node path to its inner node type. */
type AsNode<T> = T extends t.Node ? T : T extends NodePath<infer U> ? U : never;

/** A function that accepts a node and checks that it is a particular type of node. */
export type Validator<T extends t.Node | null = t.Node | null> = (
    node: t.Node | null | undefined
) => node is T;

/** A validator that returns `true` if the node is `null`. */

/** Extends a validator to return `true` if the node is `null`. */
export function isNullableOf<T>(validator: Validator<AsNode<T>>): Validator<AsNode<T> | null> {
    const nullableValidator = (node: t.Node | null | undefined): node is AsNode<T> | null => {
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
