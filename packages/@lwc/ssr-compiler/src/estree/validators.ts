/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, type types as es, type NodePath } from 'estree-toolkit';
import { entries } from '@lwc/shared';

/** Unwraps a node or a node path to its inner node type. */
export type NodeType<T> = T extends es.Node
    ? T
    : T extends NodePath<infer N>
      ? N
      : T extends null
        ? null
        : never;

/** A function that accepts a node and checks that it is a particular type of node. */
export interface Validator<T> {
    (node: es.Node | null | undefined): node is NodeType<T>;
}

/** Extends a validator to return `true` if the node is `null`. */
export const nullable = <T>(validator: Validator<NonNullable<T>>) => {
    return registerValidator(
        (node) => node === null || validator(node),
        `nullable(${getValidatorName(validator)})`
    );
};

const validatorMap: WeakMap<Validator<any>, string> = new WeakMap();

const registerValidator = <V extends Validator<any>>(validator: V, name: string) => {
    if (process.env.NODE_ENV !== 'production') {
        validatorMap.set(validator, name);
    }
    return validator;
};

export function getValidatorName(validator: Validator<any>): string {
    return validatorMap.get(validator) || 'unknown validator';
}

if (process.env.NODE_ENV !== 'production') {
    for (const [key, val] of entries(is)) {
        registerValidator(val, key);
    }
}
