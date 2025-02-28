/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { normalizeStyleAttributeValue, StringReplace, StringTrim } from '@lwc/shared';
import { isValidES3Identifier } from '@babel/types';
import { expressionIrToEs } from './expression';
import type { TransformerContext } from './types';
import type {
    Attribute as IrAttribute,
    Node as IrNode,
    Property as IrProperty,
} from '@lwc/template-compiler';
import type {
    Expression as EsExpression,
    Identifier as EsIdentifier,
    MemberExpression as EsMemberExpression,
    ObjectExpression as EsObjectExpression,
    Property as EsProperty,
    Statement as EsStatement,
} from 'estree';
import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Literal as IrLiteral,
} from '@lwc/template-compiler';

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

function getRootIdentifier(node: EsMemberExpression, cxt: TransformerContext): EsIdentifier | null {
    const rootMemberExpression = getRootMemberExpression(node);
    if (is.identifier(rootMemberExpression.object)) {
        return rootMemberExpression.object;
    }
    if (cxt.templateOptions.experimentalComplexExpressions) {
        // TODO [#3370]: Implement complex template expressions
        return null;
    }
    // Should be impossible to hit, at least until we implement complex template expressions
    /* v8 ignore next */
    throw new Error(
        `Invalid expression, must be an Identifier, found type="${rootMemberExpression.type}": \`${JSON.stringify(rootMemberExpression)}\``
    );
}

/**
 * Given an expression in a context, return an expression that may be scoped to that context.
 * For example, for the expression `foo`, it will typically be `instance.foo`, but if we're
 * inside a `for:each` block then the `foo` variable may refer to the scoped `foo`,
 * e.g. `<template for:each={foos} for:item="foo">`
 * @param expression
 * @param cxt
 */
export function getScopedExpression(expression: EsExpression, cxt: TransformerContext) {
    let scopeReferencedId: EsExpression | null = null;
    if (is.memberExpression(expression)) {
        // e.g. `foo.bar` -> scopeReferencedId is `foo`
        scopeReferencedId = getRootIdentifier(expression, cxt);
    } else if (is.identifier(expression)) {
        // e.g. `foo` -> scopeReferencedId is `foo`
        scopeReferencedId = expression;
    }
    if (scopeReferencedId === null) {
        if (cxt.templateOptions.experimentalComplexExpressions) {
            // TODO [#3370]: Implement complex template expressions
            return expression;
        }
        // Should be impossible to hit, at least until we implement complex template expressions
        /* v8 ignore next */
        throw new Error(
            `Invalid expression, must be a MemberExpression or Identifier, found type="${expression.type}": \`${JSON.stringify(expression)}\``
        );
    }
    return cxt.isLocalVar(scopeReferencedId.name)
        ? expression
        : b.memberExpression(b.identifier('instance'), expression);
}

export function normalizeClassAttributeValue(value: string) {
    // @ts-expect-error weird indirection results in wrong overload being picked up
    return StringReplace.call(StringTrim.call(value), /\s+/g, ' ');
}

export function getChildAttrsOrProps(
    attrs: (IrAttribute | IrProperty)[],
    cxt: TransformerContext
): EsObjectExpression {
    const objectAttrsOrProps = attrs
        .map(({ name, value, type }) => {
            // Babel function required to align identifier validation with babel-plugin-component: https://github.com/salesforce/lwc/issues/4826
            const key = isValidES3Identifier(name) ? b.identifier(name) : b.literal(name);

            if (value.type === 'Literal' && typeof value.value === 'string') {
                let literalValue: string | boolean = value.value;
                if (name === 'style') {
                    literalValue = normalizeStyleAttributeValue(literalValue);
                } else if (name === 'class') {
                    literalValue = normalizeClassAttributeValue(literalValue);
                    if (literalValue === '') {
                        return; // do not render empty `class=""`
                    }
                } else if (name === 'spellcheck') {
                    // `spellcheck` string values are specially handled to massage them into booleans:
                    // https://github.com/salesforce/lwc/blob/574ffbd/packages/%40lwc/template-compiler/src/codegen/index.ts#L445-L448
                    literalValue = literalValue.toLowerCase() !== 'false';
                } else if (name.toLowerCase() === 'tabindex') {
                    // Global HTML "tabindex" attribute is specially massaged into a stringified number
                    // This follows the historical behavior in api.ts:
                    // https://github.com/salesforce/lwc/blob/f34a347/packages/%40lwc/engine-core/src/framework/api.ts#L193-L211
                    const shouldNormalize = parseInt(literalValue) > 0;
                    literalValue = shouldNormalize ? '0' : literalValue;
                }
                return b.property('init', key, b.literal(literalValue));
            } else if (value.type === 'Literal' && typeof value.value === 'boolean') {
                if (name === 'class') {
                    return; // do not render empty `class=""`
                }
                return b.property('init', key, b.literal(type === 'Attribute' ? '' : value.value));
            } else if (value.type === 'Identifier' || value.type === 'MemberExpression') {
                let propValue = expressionIrToEs(value, cxt);
                if (name === 'class') {
                    cxt.import('normalizeClass');
                    propValue = b.callExpression(b.identifier('normalizeClass'), [propValue]);
                } else if (name.toLowerCase() === 'tabindex') {
                    cxt.import('normalizeTabIndex');
                    propValue = b.callExpression(b.identifier('normalizeTabIndex'), [propValue]);
                }

                return b.property('init', key, propValue);
            }
            throw new Error(`Unimplemented child attr IR node type: ${value.type}`);
        })
        .filter(Boolean) as EsProperty[];

    return b.objectExpression(objectAttrsOrProps);
}

/**
 * Determine if the provided node is of type Literal
 * @param node
 */
export function isLiteral(node: IrLiteral | IrExpression | IrComplexExpression): node is IrLiteral {
    return node.type === 'Literal';
}
