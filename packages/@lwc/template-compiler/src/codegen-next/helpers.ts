/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as t from '../shared-next/estree';
import { toPropertyName } from '../shared-next/utils';
import {
    ChildNode,
    Component,
    Element,
    LWCDirectiveRenderMode,
    ParentNode,
    Slot,
} from '../shared-next/types';
import {
    isTemplate,
    isParentNode,
    isSlot,
    isForBlock,
    isBaseElement,
    isDynamicDirective,
    isIfBlock,
} from '../shared-next/ir';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_PARAMS } from '../shared-next/constants';

import CodeGen from './codegen';
import Scope from './scope';

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

export function arrayToObjectAST<T>(
    arr: Array<T>,
    keyMapper: (val: T) => string,
    valueMapper: (val: T) => t.Expression
) {
    return t.objectExpression(
        arr.map((val: T) => t.property(t.literal(keyMapper(val)), valueMapper(val)))
    );
}

//jtu: explore if you want to keep it one way or the other
// export function arrayToObjectAST<T>(
//     arr: Array<T>,
//     propertyMapper: (val: T) => string
// ): { [name: string]: T } {
//     const obj: { [name: string]: T } = {};
//     for (const val of arr) {
//         obj[propertyMapper(val)] = val;
//     }
//     return obj;
// }

function isDynamic(element: Element | Component | Slot): boolean {
    return !!element.directives?.some((dir) => isDynamicDirective(dir));
}

export function containsDynamicChildren(children: ChildNode[]): boolean {
    return children.some((child) => {
        let result = false;
        if (isForBlock(child) || isIfBlock(child)) {
            result = containsDynamicChildren(child.children);
        } else if (isBaseElement(child)) {
            result = isDynamic(child);
        }
        return result;
    });
}

// jtu: come back to this it's not ready yet
export function shouldFlatten(children: ChildNode[], codeGen: CodeGen): boolean {
    return children.some(
        (child) =>
            !!isForBlock(child) ||
            (isParentNode(child) &&
                ((isBaseElement(child) && isDynamic(child)) ||
                    ((isIfBlock(child) || isTemplate(child)) &&
                        shouldFlatten(child.children, codeGen)) ||
                    (codeGen.renderMode === LWCDirectiveRenderMode.Light && isSlot(child))))
    );
}

/**
 * Returns true if the AST element or any of its descendants use an id attribute.
 */
export function hasIdAttribute(node: ParentNode): boolean {
    // jtu:  come back and reevaluate this
    if (isBaseElement(node)) {
        // const attrs = [...node.attributes, ...node.properties].map((attr) => attr.value);
        const attrs = node.attributes.find((attr) => attr.name === 'id');
        const props = node.properties.find((prop) => prop.name === 'id');
        if (attrs || props) {
            return true;
        }
    }

    for (const child of node.children) {
        if (isParentNode(child) && hasIdAttribute(child)) {
            return true;
        }
    }

    return false;
}

export function memorizeHandler(
    codeGen: CodeGen,
    scope: Scope,
    componentHandler: t.Expression,
    handler: t.Expression
): t.Expression {
    // #439 - The handler can only be memorized if it is bound to component instance
    const id = getMemberExpressionRoot(componentHandler as t.MemberExpression);
    const shouldMemorizeHandler = scope.resolve(id);

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
    if (codeGen.renderMode === LWCDirectiveRenderMode.Light) {
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
