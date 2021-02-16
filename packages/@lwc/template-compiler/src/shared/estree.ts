/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { BaseNode, Identifier, MemberExpression, Expression } from 'estree';

export function createIdentifier(name: string, config?: Partial<Identifier>): Identifier {
    return {
        type: 'Identifier',
        name,
        ...config,
    };
}

export function isIdentifier(node: BaseNode): node is Identifier {
    return node.type === 'Identifier';
}

export function createMemberExpression(
    object: Expression,
    property: Expression,
    config?: Partial<MemberExpression>
): MemberExpression {
    return {
        type: 'MemberExpression',
        object,
        property,
        computed: false,
        optional: false,
        ...config,
    };
}

export function isMemberExpression(node: BaseNode): node is MemberExpression {
    return node.type === 'MemberExpression';
}
