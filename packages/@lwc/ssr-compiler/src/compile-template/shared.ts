/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { StringReplace, StringTrim } from '@lwc/shared';
import { Node as IrNode } from '@lwc/template-compiler';

import { bImportDeclaration } from '../estree/builders';
import { TransformerContext } from './types';
import type {
    Statement as EsStatement,
    Expression as EsExpression,
    MemberExpression as EsMemberExpression,
    Identifier as EsIdentifier,
} from 'estree';

export const bImportHtmlEscape = () => bImportDeclaration(['htmlEscape']);
export const importHtmlEscapeKey = 'import:htmlEscape';

export function optimizeAdjacentYieldStmts(statements: EsStatement[]): EsStatement[] {
    let prevStmt: EsStatement | null = null;
    return statements
        .map((stmt) => {
            if (
                // Check if the current statement and previous statement are
                // both yield expression statements that yield a string literal.
                prevStmt &&
                is.expressionStatement(prevStmt) &&
                is.yieldExpression(prevStmt.expression) &&
                !prevStmt.expression.delegate &&
                prevStmt.expression.argument &&
                is.literal(prevStmt.expression.argument) &&
                typeof prevStmt.expression.argument.value === 'string' &&
                is.expressionStatement(stmt) &&
                is.yieldExpression(stmt.expression) &&
                !stmt.expression.delegate &&
                stmt.expression.argument &&
                is.literal(stmt.expression.argument) &&
                typeof stmt.expression.argument.value === 'string'
            ) {
                prevStmt.expression.argument.value += stmt.expression.argument.value;
                return null;
            }
            prevStmt = stmt;
            return stmt;
        })
        .filter((el): el is NonNullable<EsStatement> => el !== null);
}

export function bAttributeValue(node: IrNode, attrName: string): EsExpression {
    if (!('attributes' in node)) {
        throw new TypeError(`Cannot get attribute value from ${node.type}`);
    }
    const nameAttrValue = node.attributes.find((attr) => attr.name === attrName)?.value;
    if (!nameAttrValue) {
        return b.literal(null);
    } else if (nameAttrValue.type === 'Literal') {
        const name = typeof nameAttrValue.value === 'string' ? nameAttrValue.value : '';
        return b.literal(name);
    } else {
        return b.memberExpression(b.literal('instance'), nameAttrValue as EsExpression);
    }
}

function getRootMemberExpression(node: EsMemberExpression): EsMemberExpression {
    return node.object.type === 'MemberExpression' ? getRootMemberExpression(node.object) : node;
}

function getRootIdentifier(node: EsMemberExpression): EsIdentifier | null {
    const rootMemberExpression = getRootMemberExpression(node);
    return is.identifier(rootMemberExpression?.object) ? rootMemberExpression.object : null;
}

/**
 * Given an expression in a context, return an expression that may be scoped to that context.
 * For example, for the expression `foo`, it will typically be `instance.foo`, but if we're
 * inside a `for:each` block then the `foo` variable may refer to the scoped `foo`,
 * e.g. `<template for:each={foos} for:item="foo">`
 * @param expression
 */
export function getScopedExpression(expression: EsExpression, cxt: TransformerContext) {
    const scopeReferencedId = is.memberExpression(expression)
        ? getRootIdentifier(expression)
        : null;
    return cxt.isLocalVar(scopeReferencedId?.name)
        ? expression
        : b.memberExpression(b.identifier('instance'), expression);
}

export function normalizeClassAttributeValue(value: string) {
    // @ts-expect-error weird indirection results in wrong overload being picked up
    return StringReplace.call(StringTrim.call(value), /\s+/g, ' ');
}
