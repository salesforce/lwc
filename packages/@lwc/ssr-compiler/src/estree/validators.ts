/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import type { CallExpression, Identifier, MemberExpression, SimpleLiteral } from 'estree';
import type { Checker } from 'estree-toolkit/dist/generated/is-type';
import type { Node } from 'estree-toolkit/dist/helpers'; // estree's `Node` is not compatible?

export const isStringLiteral = (
    node: Node | null | undefined
): node is SimpleLiteral & { value: string } => {
    return is.literal(node) && typeof node.value === 'string';
};

type RenderIdentifier = Identifier & { name: 'render' };
type RenderMemberExpression = MemberExpression & { property: RenderIdentifier };
type RenderCall = CallExpression & { callee: RenderMemberExpression };

/** Returns `true` if the node is an identifier or `<something>.render()`. */
export const isIdentOrRenderCall = (
    node: Node | null | undefined
): node is Identifier | RenderCall => {
    return (
        is.identifier(node) ||
        (is.callExpression(node) &&
            is.memberExpression(node.callee) &&
            is.identifier(node.callee.property) &&
            node.callee.property.name === 'render')
    );
};

/** A validator that returns `true` if the node is `null`. */
type NullableChecker<T extends Node> = (node: Node | null | undefined) => node is T | null;

/** Extends a validator to return `true` if the node is `null`. */
export function isNullableOf<T extends Node>(validator: Checker<T>): NullableChecker<T> {
    return (node: Node | null | undefined) => node === null || validator(node);
}
