/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import State from '../state';

import * as t from '../shared/estree';
import { toPropertyName } from '../shared/utils';
import { IRElement, IRNode } from '../shared/types';
import { isElement, isTemplate, isComponentProp } from '../shared/ir';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_PARAMS } from '../shared/constants';

import CodeGen from './codegen';

export function identifierFromComponentName(name: string): t.Identifier {
    return t.identifier(`_${toPropertyName(name)}`);
}

export function getMemberExpressionRoot(expression: t.MemberExpression): t.Identifier {
    let current: t.Expression | t.Identifier = expression;

    while (t.isMemberExpression(current)) {
        current = current.object as t.Expression;
    }

    return current as t.Identifier;
}

export function objectToAST(
    obj: object,
    valueMapper: (key: string) => t.Expression
): t.ObjectExpression {
    return t.objectExpression(
        Object.keys(obj).map((key) => t.property(t.literal(key), valueMapper(key)))
    );
}

function isDynamic(element: IRElement): boolean {
    return element.lwc?.dynamic !== undefined;
}

export function containsDynamicChildren(children: IRNode[]): boolean {
    return children.some((child) => isElement(child) && isDynamic(child));
}

export function shouldFlatten(children: IRNode[]): boolean {
    return children.some(
        (child) =>
            isElement(child) &&
            (isDynamic(child) ||
                !!child.forEach ||
                !!child.forOf ||
                (isTemplate(child) && shouldFlatten(child.children)))
    );
}

export function memorizeHandler(
    codeGen: CodeGen,
    element: IRElement,
    componentHandler: t.Expression,
    handler: t.Expression
): t.Expression {
    // #439 - The handler can only be memorized if it is bound to component instance
    const id = getMemberExpressionRoot(componentHandler as t.MemberExpression);
    const shouldMemorizeHandler = isComponentProp(id, element);

    // Apply memorization if the handler is memorizable.
    //   $cmp.handlePress -> _m1 || ($ctx._m1 = b($cmp.handlePress))
    if (shouldMemorizeHandler) {
        const memorizedId = codeGen.getMemorizationId();
        const memorization = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(TEMPLATE_PARAMS.CONTEXT), memorizedId),
            handler
        );

        handler = t.logicalExpression('||', memorizedId, memorization);
    }
    return handler;
}

export function generateTemplateMetadata(state: State): t.Statement[] {
    const metadataExpressions: t.Statement[] = [];

    if (state.slots.length) {
        const slotsProperty = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier('slots')
        );

        const slotsArray = t.arrayExpression(state.slots.map((slot) => t.literal(slot)));

        const slotsMetadata = t.assignmentExpression('=', slotsProperty, slotsArray);
        metadataExpressions.push(t.expressionStatement(slotsMetadata));
    }

    const stylesheetsMetadata = t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('stylesheets')),
        t.arrayExpression([])
    );
    metadataExpressions.push(t.expressionStatement(stylesheetsMetadata));

    return metadataExpressions;
}
