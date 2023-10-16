/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { APIFeature, APIVersion, HTML_NAMESPACE, isAPIFeatureEnabled } from '@lwc/shared';
import * as t from '../shared/estree';
import { isLiteral } from '../shared/estree';
import { toPropertyName } from '../shared/utils';
import { BaseElement, ChildNode, LWCDirectiveRenderMode, Node, Root } from '../shared/types';
import {
    isBaseElement,
    isComment,
    isConditionalParentBlock,
    isElement,
    isForBlock,
    isIf,
    isParentNode,
    isSlot,
    isText,
} from '../shared/ast';
import {
    STATIC_SAFE_DIRECTIVES,
    TEMPLATE_FUNCTION_NAME,
    TEMPLATE_PARAMS,
} from '../shared/constants';
import {
    isAllowedFragOnlyUrlsXHTML,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';
import State from '../state';
import { isCustomRendererHookRequired } from '../shared/renderer-hooks';
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

/**
 * Returns true if the children should be flattened.
 *
 * This function searches through the children to determine if flattening needs to occur in the runtime.
 * Children should be flattened if they contain an iterator, a dynamic directive or a slot inside a light dom element.
 */
export function shouldFlatten(codeGen: CodeGen, children: ChildNode[]): boolean {
    return children.some((child) => {
        return (
            // ForBlock will generate a list of iterable vnodes
            isForBlock(child) ||
            // light DOM slots - backwards-compatible behavior uses flattening, new behavior uses fragments
            (!isAPIFeatureEnabled(
                APIFeature.USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS,
                codeGen.apiVersion
            ) &&
                isSlot(child) &&
                codeGen.renderMode === LWCDirectiveRenderMode.light) ||
            // If node is only a control flow node and does not map to a stand alone element.
            // Search children to determine if it should be flattened.
            (isIf(child) && shouldFlatten(codeGen, child.children))
        );
    });
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

    if (codeGen.hasRefs) {
        const refsMetadata = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('hasRefs')),
            t.literal(true)
        );
        metadataExpressions.push(t.expressionStatement(refsMetadata));
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

function isStaticNode(node: BaseElement, apiVersion: APIVersion): boolean {
    let result = true;
    const { name: nodeName, namespace = '', attributes, directives, properties } = node;

    // SVG is excluded from static content optimization in older API versions due to issues with case sensitivity
    // in CSS scope tokens. See https://github.com/salesforce/lwc/issues/3313
    if (
        !isAPIFeatureEnabled(APIFeature.LOWERCASE_SCOPE_TOKENS, apiVersion) &&
        namespace !== HTML_NAMESPACE
    ) {
        return false;
    }

    // it is an element
    result &&= isElement(node);

    // all attrs are static-safe
    result &&= attributes.every(({ name, value }) => {
        return (
            isLiteral(value) &&
            name !== 'slot' &&
            // check for ScopedId
            name !== 'id' &&
            name !== 'spellcheck' && // spellcheck is specially handled by the vnodes.
            !isIdReferencingAttribute(name) &&
            // svg href needs sanitization.
            !isSvgUseHref(nodeName, name, namespace) &&
            // Check for ScopedFragId
            !(
                isAllowedFragOnlyUrlsXHTML(nodeName, name, namespace) &&
                isFragmentOnlyUrl(value.value as string)
            )
        );
    });

    // all directives are static-safe
    result &&= !directives.some((directive) => !STATIC_SAFE_DIRECTIVES.has(directive.name));

    // all properties are static
    result &&= properties.every((prop) => isLiteral(prop.value));

    return result;
}

function collectStaticNodes(node: ChildNode, staticNodes: Set<ChildNode>, state: State) {
    let childrenAreStatic = true;
    let nodeIsStatic;

    if (isText(node)) {
        nodeIsStatic = isLiteral(node.value);
    } else if (isComment(node)) {
        nodeIsStatic = true;
    } else {
        // it is ElseBlock | ForBlock | If | BaseElement
        node.children.forEach((childNode) => {
            collectStaticNodes(childNode, staticNodes, state);

            childrenAreStatic &&= staticNodes.has(childNode);
        });

        // for IfBlock and ElseifBlock, traverse down the else branch
        if (isConditionalParentBlock(node) && node.else) {
            collectStaticNodes(node.else, staticNodes, state);
        }

        nodeIsStatic =
            isBaseElement(node) &&
            !isCustomRendererHookRequired(node, state) &&
            isStaticNode(node, state.config.apiVersion);
    }

    if (nodeIsStatic && childrenAreStatic) {
        staticNodes.add(node);
    }
}

export function getStaticNodes(root: Root, state: State): Set<ChildNode> {
    const staticNodes = new Set<ChildNode>();

    root.children.forEach((childNode) => {
        collectStaticNodes(childNode, staticNodes, state);
    });

    return staticNodes;
}
