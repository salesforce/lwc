/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, type types as es, type NodePath } from 'estree-toolkit';
import { entries } from '@lwc/shared';

/** Unwraps a node or a node path to its inner node type. */
export type NodeType<T> = T extends null
    ? null
    : T extends es.Node
      ? T
      : T extends NodePath<infer U>
        ? U
        : never;

/** A function that accepts a node and checks that it is a particular type of node. */
export type Validator<T> = (node: es.Node | null | undefined) => node is NodeType<T>;

/** Extends a validator to return `true` if the node is `null`. */
export function nullable<T>(validator: Validator<T & {}>) {
    const nullableValidator = (node: es.Node | null | undefined): node is NodeType<T | null> => {
        return node === null || validator(node);
    };
    if (process.env.NODE_ENV !== 'production') {
        validatorMap.set(nullableValidator, `nullable(${getValidatorName(validator)})`);
    }
    return nullableValidator;
}

let validatorMap: WeakMap<Validator<any>, string> = new WeakMap();

if (process.env.NODE_ENV !== 'production') {
    for (const [key, val] of entries(is)) {
        validatorMap.set(val, key);
    }
}

export function getValidatorName(validator: Validator<any>): string {
    return validatorMap.get(validator) || 'unknown validator';
}
