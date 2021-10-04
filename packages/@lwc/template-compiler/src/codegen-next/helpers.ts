/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as t from '../shared/estree';
import { toPropertyName } from '../shared/utils';
import { IRElement, IRNode, LWCDirectiveRenderMode } from '../shared/types';
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

export function shouldFlatten(children: IRNode[], codeGen: CodeGen): boolean {
    return children.some(
        (child) =>
            isElement(child) &&
            (isDynamic(child) ||
                !!child.forEach ||
                !!child.forOf ||
                (codeGen.renderMode === LWCDirectiveRenderMode.light && child.tag === 'slot') ||
                (isTemplate(child) && shouldFlatten(child.children, codeGen)))
    );
}

/**
 * Returns true if the AST element or any of its descendants use an id attribute.
 */
export function hasIdAttribute(element: IRElement): boolean {
    if (element.attrs?.id || element.props?.id) {
        return true;
    }

    for (const child of element.children) {
        if (child.type === 'element' && hasIdAttribute(child)) {
            return true;
        }
    }

    return false;
}

export function memorizeHandler(
    codeGen: CodeGen,
    element: IRElement,
    parentStack: IRNode[],
    componentHandler: t.Expression,
    handler: t.Expression
): t.Expression {
    // #439 - The handler can only be memorized if it is bound to component instance
    const id = getMemberExpressionRoot(componentHandler as t.MemberExpression);
    const shouldMemorizeHandler = isComponentProp(id, element, parentStack);

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

export function generateTemplateMetadata(codeGen: CodeGen): t.Statement[] {
    const metadataExpressions: t.Statement[] = [];

    if (codeGen.slotNames.size) {
        const slotsProperty = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier('slots')
        );

        const slotsArray = t.arrayExpression(
            Array.from(codeGen.slotNames)
                .sort()
                .map((slot) => t.literal(slot))
        );

        const slotsMetadata = t.assignmentExpression('=', slotsProperty, slotsArray);
        metadataExpressions.push(t.expressionStatement(slotsMetadata));
    }

    const stylesheetsMetadata = t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('stylesheets')),
        t.arrayExpression([])
    );
    metadataExpressions.push(t.expressionStatement(stylesheetsMetadata));

    // ignore when shadow because we don't want to modify template unnecessarily
    if (codeGen.renderMode === LWCDirectiveRenderMode.light) {
        const renderModeMetadata = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('renderMode')),
            t.literal('light')
        );
        metadataExpressions.push(t.expressionStatement(renderModeMetadata));
    }

    return metadataExpressions;
}

const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/;

// Borrowed from Vue template compiler.
// https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16
export function parseStyleText(cssText: string): { [name: string]: string } {
    const styleMap: { [name: string]: string } = {};

    const declarations = cssText.split(DECLARATION_DELIMITER);
    for (const declaration of declarations) {
        if (declaration) {
            const [prop, value] = declaration.split(PROPERTY_DELIMITER);

            if (prop !== undefined && value !== undefined) {
                styleMap[prop.trim()] = value.trim();
            }
        }
    }

    return styleMap;
}

// Given a map of CSS property keys to values, return an array AST like:
// ['color', 'blue', false]    // { color: 'blue' }
// ['background', 'red', true] // { background: 'red !important' }
export function styleMapToStyleDeclsAST(styleMap: { [name: string]: string }): t.ArrayExpression {
    const styles: Array<[string, string] | [string, string, boolean]> = Object.entries(
        styleMap
    ).map(([key, value]) => {
        const important = value.endsWith('!important');
        if (important) {
            // trim off the trailing "!important" (10 chars)
            value = value.substring(0, value.length - 10).trim();
        }
        return [key, value, important];
    });
    return t.arrayExpression(
        styles.map((arr) => t.arrayExpression(arr.map((val) => t.literal(val))))
    );
}

const CLASSNAME_DELIMITER = /\s+/;

export function parseClassNames(classNames: string): string[] {
    return classNames
        .split(CLASSNAME_DELIMITER)
        .map((className) => className.trim())
        .filter((className) => className.length);
}
