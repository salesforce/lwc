/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { normalizeStyleAttribute, reservedKeywords } from '@lwc/shared';
import {
    Node as IrNode,
    Attribute as IrAttribute,
    Property as IrProperty,
} from '@lwc/template-compiler';

import { bImportDeclaration } from '../estree/builders';
import { TransformerContext } from './types';
import { expressionIrToEs } from './expression';
import type {
    Statement as EsStatement,
    Expression as EsExpression,
    MemberExpression as EsMemberExpression,
    Identifier as EsIdentifier,
    ObjectExpression as EsObjectExpression,
} from 'estree';

export const bImportHtmlEscape = () => bImportDeclaration(['htmlEscape']);
export const importHtmlEscapeKey = 'import:htmlEscape';

// This is a mostly-correct regular expression will only match if the entire string
// provided is a valid ECMAScript identifier. Its imperfections lie in the fact that
// it will match strings like "export" when "export" is actually a reserved keyword
// and therefore not a valid identifier. When combined with a check against reserved
// keywords, it is a reliable test for whether a provided string is a valid identifier.
const imperfectIdentifierMatcher = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

export const isValidIdentifier = (str: string) =>
    !reservedKeywords.has(str) && imperfectIdentifierMatcher.test(str);

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

export function getChildAttrsOrProps(
    attrs: (IrAttribute | IrProperty)[],
    cxt: TransformerContext
): EsObjectExpression {
    const objectAttrsOrProps = attrs.map((attr) => {
        const key = isValidIdentifier(attr.name) ? b.identifier(attr.name) : b.literal(attr.name);
        if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
            const value =
                attr.name === 'style'
                    ? normalizeStyleAttribute(attr.value.value)
                    : attr.value.value;
            return b.property('init', key, b.literal(value));
        } else if (attr.value.type === 'Literal' && typeof attr.value.value === 'boolean') {
            return b.property(
                'init',
                key,
                b.literal(attr.type === 'Attribute' ? '' : attr.value.value)
            );
        } else if (attr.value.type === 'Identifier' || attr.value.type === 'MemberExpression') {
            const propValue = expressionIrToEs(attr.value, cxt);
            return b.property('init', key, propValue);
        }
        throw new Error(`Unimplemented child attr IR node type: ${attr.value.type}`);
    });

    return b.objectExpression(objectAttrsOrProps);
}
