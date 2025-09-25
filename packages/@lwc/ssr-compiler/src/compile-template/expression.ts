/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { bindExpression } from '@lwc/template-compiler';
import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Identifier as IrIdentifier,
    MemberExpression as IrMemberExpression,
} from '@lwc/template-compiler';
import type { Identifier as EsIdentifier, Expression as EsExpression } from 'estree';
import type { TransformerContext } from './types';

export function expressionIrToEs(
    node: IrExpression | IrComplexExpression,
    cxt: TransformerContext
): EsExpression {
    return bindExpression(
        node as IrComplexExpression,
        (n: EsIdentifier) => cxt.isLocalVar((n as EsIdentifier).name),
        'instance',
        cxt.templateOptions.experimentalComplexExpressions
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
export function getScopedExpression(
    expression: IrExpression,
    cxt: TransformerContext
): EsExpression {
    let scopeReferencedId: IrExpression | null = null;
    if (expression.type === 'MemberExpression') {
        // e.g. `foo.bar` -> scopeReferencedId is `foo`
        scopeReferencedId = getRootIdentifier(expression);
    } else if (expression.type === 'Identifier') {
        // e.g. `foo` -> scopeReferencedId is `foo`
        scopeReferencedId = expression;
    }

    if (scopeReferencedId === null && !cxt.templateOptions.experimentalComplexExpressions) {
        throw new Error(
            `Invalid expression, must be a MemberExpression or Identifier, found type="${expression.type}": \`${JSON.stringify(expression)}\``
        );
    }

    return cxt.isLocalVar(scopeReferencedId?.name)
        ? (expression as EsExpression)
        : expressionIrToEs(expression, cxt);
}

function getRootMemberExpression(node: IrMemberExpression): IrMemberExpression {
    return node.object.type === 'MemberExpression' ? getRootMemberExpression(node.object) : node;
}

function getRootIdentifier(node: IrMemberExpression): IrIdentifier {
    const rootMemberExpression = getRootMemberExpression(node);
    if (rootMemberExpression.object.type === 'Identifier') {
        return rootMemberExpression.object;
    }

    throw new Error(
        `Invalid expression, must be an Identifier, found type="${rootMemberExpression.type}": \`${JSON.stringify(rootMemberExpression)}\``
    );
}
