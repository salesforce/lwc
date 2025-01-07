/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-disable-next-line no-restricted-imports -- This is the only place where we should be importing `is` from estree-toolkit. */
import { is as _is } from 'estree-toolkit';

import { entries } from '@lwc/shared';
import type { Checker } from 'estree-toolkit/dist/generated/is-type';
import type { Node } from 'estree-toolkit/dist/helpers'; // estree's `Node` is not compatible?
import type { Node as EsNode } from 'estree';
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

/** A function that accepts a node and checks that it is a particular type of node. */
export type Validator<T extends EsNode | null = EsNode | null> = {
    (node: EsNode | null | undefined): node is T;
    __debugName?: string;
    __stack?: string;
};

const is: {
    [K in keyof typeof _is]: (typeof _is)[K] & { __debugName?: string; __stack?: string };
} = structuredClone(_is);

if (process.env.NODE_ENV !== 'production') {
    for (const [key, val] of entries(is)) {
        val.__debugName = key;
        Object.defineProperty(is, key, {
            get: function get() {
                const stack: { stack?: string } = {};
                Error.captureStackTrace(stack, get);
                val.__stack = stack.stack;
                return val;
            },
        });
    }
}

export { is };
