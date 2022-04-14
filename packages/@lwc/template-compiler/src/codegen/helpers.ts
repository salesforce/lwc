/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlEscape, isVoidElement } from '@lwc/shared';
import * as t from '../shared/estree';
import { toPropertyName } from '../shared/utils';
import {
    Attribute,
    BaseElement,
    ChildNode,
    Element,
    Literal,
    LWCDirectiveRenderMode,
    Node,
    Property,
} from '../shared/types';
import {
    isParentNode,
    isSlot,
    isForBlock,
    isBaseElement,
    isIf,
    isDynamicDirective,
    isElement,
    isText,
    isComment,
} from '../shared/ast';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_PARAMS } from '../shared/constants';

import CodeGen from './codegen';

const rawContentElements = new Set([
    'STYLE',
    'SCRIPT',
    'XMP',
    'IFRAME',
    'NOEMBED',
    'NOFRAMES',
    'PLAINTEXT',
    'NOSCRIPT',
]);

function serializeAttrs(element: Element): string {
    /**
     * 0: styleToken in existing class attr
     * 1: styleToken for added class attr
     * 2: styleToken as attr
     */
    const attrs: string[] = [];
    let hasClassAttr = false;

    const collector = ({ name, value }: Attribute | Property) => {
        let v = (value as Literal).value;

        if (name === 'class') {
            hasClassAttr = true;
            v += '${0}';
        }
        if (typeof v === 'string') {
            attrs.push(`${name}="${htmlEscape(v, true)}"`);
        } else {
            attrs.push(name);
        }
    };

    element.attributes.forEach(collector);
    element.properties.forEach(collector);

    return (attrs.length > 0 ? ' ' : '') + attrs.join(' ') + (hasClassAttr ? '${2}' : '${1}${2}');
}

function serializeChildren(children: ChildNode[], parentTagName: string): string {
    let html = '';

    children.forEach((child) => {
        if (isElement(child)) {
            html += serializeStaticElement(child);
        } else if (isText(child)) {
            if (rawContentElements.has(parentTagName.toUpperCase())) {
                html += child.raw;
            } else {
                html += htmlEscape((child.value as Literal<string>).value);
            }
        } else if (isComment(child)) {
            html += `<!--${htmlEscape(child.value)}-->`;
        } else {
            throw new TypeError(
                'Unknown node found while serializing static content. Allowed nodes types are: Element, Text and Comment.'
            );
        }
    });

    return html;
}

export function serializeStaticElement(element: Element): string {
    const tagName = element.name;

    let html = '<' + tagName + serializeAttrs(element) + '>';

    html += serializeChildren(element.children, tagName);

    // element.children.length > 0 can happen in the SVG namespace.
    if (!isVoidElement(tagName) || element.children.length > 0) {
        html += `</${tagName}>`;
    }

    return html;
}

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

function isDynamic(element: BaseElement): boolean {
    return element.directives.some(isDynamicDirective);
}

export function containsDynamicChildren(children: ChildNode[]): boolean {
    return children.some((child) => {
        if (isForBlock(child) || isIf(child)) {
            return containsDynamicChildren(child.children);
        }

        if (isBaseElement(child)) {
            return isDynamic(child);
        }

        return false;
    });
}

/**
 * Returns true if the children should be flattened.
 *
 * Children should be flattened if they contain an iterator,
 * a dynamic directive or a slot inside a light dom element.
 */
export function shouldFlatten(codeGen: CodeGen, children: ChildNode[]): boolean {
    return children.some(
        (child) =>
            isForBlock(child) ||
            (isParentNode(child) &&
                ((isBaseElement(child) && isDynamic(child)) ||
                    // If node is only a control flow node and does not map to a stand alone element.
                    // Search children to determine if it should be flattened.
                    (isIf(child) && shouldFlatten(codeGen, child.children)) ||
                    (codeGen.renderMode === LWCDirectiveRenderMode.light && isSlot(child))))
    );
}

/**
 * Returns true if the AST element or any of its descendants use an id attribute.
 */
export function hasIdAttribute(node: Node): boolean {
    if (isBaseElement(node)) {
        const hasIdAttr = [...node.attributes, ...node.properties].some(
            ({ name }) => name === 'id'
        );

        if (hasIdAttr) {
            return true;
        }
    }

    if (isParentNode(node)) {
        return node.children.some((child) => hasIdAttribute(child));
    }

    return false;
}

export function memorizeHandler(
    codeGen: CodeGen,
    componentHandler: t.Expression,
    handler: t.Expression
): t.Expression {
    // #439 - The handler can only be memorized if it is bound to component instance
    const id = getMemberExpressionRoot(componentHandler as t.MemberExpression);
    const shouldMemorizeHandler = !codeGen.isLocalIdentifier(id);

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
