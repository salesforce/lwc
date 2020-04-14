/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as t from '@babel/types';
import { toPropertyName } from '../shared/utils';

import State from '../state';
import { isElement, isComponentProp } from '../shared/ir';
import { IRElement } from '../shared/types';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_PARAMS } from '../shared/constants';
import { kebabcaseToCamelcase } from '../shared/naming';
import CodeGen from './codegen';

export function identifierFromComponentName(name: string): t.Identifier {
    return t.identifier(`_${toPropertyName(name)}`);
}

export { kebabcaseToCamelcase };

export function getMemberExpressionRoot(expression: t.MemberExpression): t.Identifier {
    let current: t.Expression | t.Identifier = expression;
    while (t.isMemberExpression(current)) {
        current = current.object;
    }

    return current as t.Identifier;
}

export function objectToAST(
    obj: object,
    valueMapper: (key: string) => t.Expression
): t.ObjectExpression {
    return t.objectExpression(
        Object.keys(obj).map((key) => t.objectProperty(t.stringLiteral(key), valueMapper(key)))
    );
}

/** Returns true if the passed element is a template element */
export function isTemplate(element: IRElement) {
    return element.tag === 'template';
}

export function isStyleSheet(element: IRElement) {
    return element.tag === 'style';
}

/** Returns true if the passed element is a slot element */
export function isSlot(element: IRElement) {
    return element.tag === 'slot';
}

export function containsDynamicChildren(element: IRElement) {
    return element.children.some((child) => isElement(child) && isDynamic(child));
}

export function isDynamic(element: IRElement): boolean {
    return !!(element.lwc && element.lwc.dynamic);
}

/**
 * Returns true if the passed element should be flattened.
 *
 * TODO [#1303]: Move this logic into the optimizing compiler. This kind of optimization should be
 * done before the actual code generation.
 */
export function shouldFlatten(element: IRElement): boolean {
    return element.children.some(
        (child) =>
            isElement(child) &&
            (isDynamic(child) ||
                !!child.forEach ||
                !!child.forOf ||
                (isTemplate(child) && shouldFlatten(child)))
    );
}

export function destructuringAssignmentFromObject(
    target: t.Identifier | t.MemberExpression,
    keys: t.ObjectProperty[],
    type: string = 'const'
) {
    return t.variableDeclaration(type as any, [
        t.variableDeclarator(t.objectPattern(keys as any), target),
    ]);
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

    // Generate the slots property on template function if slots are defined in the template:
    //      tmpl.slots = ['', 'x']
    if (state.slots.length) {
        const slotsProperty = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier('slots')
        );

        const slotsArray = t.arrayExpression(state.slots.map((slot) => t.stringLiteral(slot)));

        const slotsMetadata = t.assignmentExpression('=', slotsProperty, slotsArray);
        metadataExpressions.push(t.expressionStatement(slotsMetadata));
    }

    metadataExpressions.push(...state.inlineStyle.body);

    const hasInlineStyles = state.inlineStyle.body.length;

    const stylesheetsProperty = t.memberExpression(
        t.identifier(TEMPLATE_FUNCTION_NAME),
        t.identifier('stylesheets')
    );

    const stylesheetsMetadata = t.assignmentExpression(
        '=',
        stylesheetsProperty,
        hasInlineStyles ? t.identifier('stylesheets') : t.arrayExpression()
    );
    metadataExpressions.push(t.expressionStatement(stylesheetsMetadata));

    return metadataExpressions;
}
