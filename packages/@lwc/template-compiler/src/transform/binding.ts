/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babelTypes from '@babel/types';
import { CompilerDiagnostic } from '@lwc/errors';
import { isUndefined } from '@lwc/shared';

import {
    IRAttributeType,
    IRElement,
    IRExpressionAttribute,
    TemplateParseResult,
} from '../shared/types';

type BabelTemplateExpression = babelTypes.Identifier | babelTypes.MemberExpression;

interface BindingASTIdentifier {
    name: string;
    type: 'BindingASTIdentifier';
}

interface BindingASTMemberExpression {
    object: BindingASTMemberExpression | BindingASTIdentifier;
    property: BindingASTIdentifier;
    type: 'BindingASTMemberExpression';
}

interface BindingASTAttribute {
    expression: BindingASTIdentifier | BindingASTMemberExpression;
    name: string;
    type: 'BindingASTAttribute';
}

interface BindingASTNode {
    children: Array<BindingASTNode | BindingASTSlotNode | BindingASTComponentNode>;
    forEach?: {
        expression: BindingASTIdentifier | BindingASTMemberExpression;
        index?: BindingASTIdentifier | undefined;
        item: BindingASTIdentifier;
    };
    forOf?: {
        expression: BindingASTIdentifier | BindingASTMemberExpression;
        iterator: BindingASTIdentifier;
    };
    if?: {
        expression: BindingASTIdentifier | BindingASTMemberExpression;
        modifier: string;
    };
    type: 'BindingASTNode';
}

interface BindingASTSlotNode {
    children: Array<BindingASTNode | BindingASTSlotNode | BindingASTComponentNode>;
    name: string;
    type: 'BindingASTSlotNode';
}

interface BindingASTComponentNode {
    attributes: BindingASTAttribute[];
    children: Array<BindingASTNode | BindingASTSlotNode | BindingASTComponentNode>;
    component: true;
    tag: string;
    type: 'BindingASTComponentNode';
}

export interface BindingParseResult {
    root: BindingASTNode | undefined;
    warnings: CompilerDiagnostic[];
}

function isExpressionAttribute(attr) {
    return attr.type === IRAttributeType.Expression;
}

function pruneExpression(
    attr: BabelTemplateExpression
): BindingASTIdentifier | BindingASTMemberExpression {
    if (babelTypes.isIdentifier(attr)) {
        return {
            type: 'BindingASTIdentifier',
            name: attr.name,
        };
    }
    return pruneMemberExpression(attr);
}

function pruneMemberExpression(
    expression: babelTypes.MemberExpression
): BindingASTMemberExpression {
    if (babelTypes.isIdentifier(expression.object)) {
        return {
            type: 'BindingASTMemberExpression',
            object: {
                type: 'BindingASTIdentifier',
                name: expression.object.name,
            },
            property: {
                type: 'BindingASTIdentifier',
                name: expression.property.name,
            },
        };
    } else {
        const object = expression.object as babelTypes.MemberExpression;
        return {
            type: 'BindingASTMemberExpression',
            object: pruneMemberExpression(object),
            property: {
                type: 'BindingASTIdentifier',
                name: expression.property.name,
            },
        };
    }
}

function getExpressionAttributes(node: IRElement): BindingASTAttribute[] {
    const { props = {} } = node;
    const attrs: BindingASTAttribute[] = [];
    return Object.values(props).reduce((acc, attr) => {
        if (isExpressionAttribute(attr)) {
            const expressionAttribute = attr as IRExpressionAttribute;
            acc.push({
                type: 'BindingASTAttribute',
                name: attr.name,
                // Force BabelTemplateExpression because IRTemplateExpression.value
                // can also be a literal...is that a bug?
                expression: pruneExpression(expressionAttribute.value as BabelTemplateExpression),
            });
        }
        return acc;
    }, attrs);
}

function collectComponentsAndSlots(rootElement: IRElement): IRElement[] {
    const components: IRElement[] = [];
    function depthFirstCollect(element: IRElement) {
        if (element.children) {
            element.children.forEach(depthFirstCollect);
        }
        if (isComponent(element) || isSlot(element)) {
            components.push(element);
        }
    }
    depthFirstCollect(rootElement);
    return components;
}

function hasDirective(element: IRElement): boolean {
    return Boolean(element.forEach || element.forOf || element.if);
}

function isComponent(element: IRElement): boolean {
    return Boolean(element.component);
}

function isSlot(element: IRElement): boolean {
    return element.tag === 'slot';
}

// Returns a list of elements to be added to the AST in top-down order
function getPrunedPath(component: IRElement): IRElement[] {
    function prune(elm: IRElement, path: IRElement[]) {
        if (isUndefined(elm.parent)) {
            // Base case: root element
            return [elm, ...path];
        }
        if (hasDirective(elm) || isComponent(elm) || isSlot(elm)) {
            path = [elm, ...path];
        }
        return prune(elm.parent, path);
    }
    // `component.parent!` because components from a parsed template always have a parent
    return prune(component.parent!, [component]);
}

function transformToDirectiveNode(element: IRElement): BindingASTNode {
    const { forEach, forOf, if: ifDirective, ifModifier } = element;
    if (forEach) {
        const expression = forEach.expression as BabelTemplateExpression;
        return {
            type: 'BindingASTNode',
            forEach: {
                expression: pruneExpression(expression),
                item: {
                    type: 'BindingASTIdentifier',
                    name: forEach.item.name,
                },
            },
            children: [],
        };
    }
    if (forOf) {
        const expression = forOf.expression as BabelTemplateExpression;
        return {
            type: 'BindingASTNode',
            forOf: {
                expression: pruneExpression(expression),
                iterator: {
                    type: 'BindingASTIdentifier',
                    name: forOf.iterator.name,
                },
            },
            children: [],
        };
    }
    if (ifDirective && ifModifier) {
        const directive = element.if as BabelTemplateExpression;
        return {
            type: 'BindingASTNode',
            if: {
                expression: pruneExpression(directive),
                modifier: ifModifier,
            },
            children: [],
        };
    }
    throw new Error('Element must have either a `for:each`, `iterator:*`, or `if` directive.');
}

function transformToSlotNode(element: IRElement): BindingASTSlotNode {
    if (isSlot(element)) {
        return {
            type: 'BindingASTSlotNode',
            name: element.slotName || '',
            children: [],
        };
    }
    throw new Error(`Expected element ${element.tag} to be a slot.`);
}

function transformToComponentNode(element: IRElement): BindingASTComponentNode {
    const { component, tag } = element;
    if (component) {
        return {
            type: 'BindingASTComponentNode',
            tag,
            component: true,
            attributes: getExpressionAttributes(element),
            children: [],
        };
    }
    throw new Error('Element must be associated with a component.');
}

function buildAST(rootIRElement: IRElement | undefined): BindingASTNode | undefined {
    if (isUndefined(rootIRElement)) {
        return undefined;
    }

    const astNodeMap = new WeakMap<IRElement, BindingASTNode | BindingASTComponentNode>();
    astNodeMap.set(rootIRElement, {
        type: 'BindingASTNode',
        children: [],
    });

    const components = collectComponentsAndSlots(rootIRElement);
    components.forEach(component => {
        // Top-down path
        const prunedPath = getPrunedPath(component);
        prunedPath.forEach((currentElement, index) => {
            // If the current element does not have a node representation in the AST.
            if (!astNodeMap.has(currentElement)) {
                const parentElement = prunedPath[index - 1];
                const parentASTNode = astNodeMap.get(parentElement)!;
                if (isComponent(currentElement) || isSlot(currentElement)) {
                    let astNode;
                    if (isComponent(currentElement)) {
                        astNode = transformToComponentNode(currentElement);
                    } else {
                        astNode = transformToSlotNode(currentElement);
                    }
                    if (hasDirective(currentElement)) {
                        // If the component has an inline directive, then create
                        // a "virtual" directive node and insert the directive
                        // node between the parent and child node.
                        const directiveNode = transformToDirectiveNode(currentElement);
                        parentASTNode.children.push(directiveNode);
                        directiveNode.children.push(astNode);
                    } else {
                        parentASTNode.children.push(astNode);
                    }
                    astNodeMap.set(currentElement, astNode);
                } else {
                    const directiveNode = transformToDirectiveNode(currentElement);
                    parentASTNode.children.push(directiveNode);
                    astNodeMap.set(currentElement, directiveNode);
                }
            }
        });
    });
    return astNodeMap.get(rootIRElement) as BindingASTNode;
}

export default function transform(parsedTemplate: TemplateParseResult): BindingParseResult {
    const { root, warnings } = parsedTemplate;
    return {
        root: buildAST(root),
        warnings,
    };
}
