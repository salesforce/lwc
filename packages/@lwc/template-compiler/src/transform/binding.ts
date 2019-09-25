/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    Identifier,
    isIdentifier,
    isMemberExpression,
    MemberExpression,
    StringLiteral,
} from '@babel/types';

import { CompilerDiagnostic } from '@lwc/errors';

function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

import {
    IRAttributeType,
    IRElement,
    TemplateParseResult,
    TemplateExpression,
} from '../shared/types';

type TemplateAttributeValue = StringLiteral | Identifier | MemberExpression;

enum BindingType {
    Boolean = 'boolean',
    Component = 'component',
    Expression = 'expression',
    ForEach = 'for-each',
    ForOf = 'for-of',
    Identifier = 'identifier',
    If = 'if',
    MemberExpression = 'member-expression',
    Root = 'root',
    Slot = 'slot',
    String = 'string',
}

interface BindingBooleanAttribute {
    name: string;
    type: BindingType.Boolean;
    value: true;
}
interface BindingExpressionAttribute {
    name: string;
    type: BindingType.Expression;
    value: BindingExpression;
}
interface BindingStringAttribute {
    name: string;
    type: BindingType.String;
    value: string;
}

type BindingAttribute =
    | BindingBooleanAttribute
    | BindingExpressionAttribute
    | BindingStringAttribute;

interface BindingIdentifier {
    name: string;
    type: BindingType.Identifier;
}

interface BindingMemberExpression {
    object: BindingIdentifier | BindingMemberExpression;
    property: BindingIdentifier;
    type: BindingType.MemberExpression;
}

type BindingExpression = BindingIdentifier | BindingMemberExpression;

interface BindingForEachDirectiveNode extends BindingBaseNode {
    expression: BindingExpression;
    index: BindingIdentifier;
    item: BindingIdentifier;
    type: BindingType.ForEach;
}

interface BindingForOfDirectiveNode extends BindingBaseNode {
    expression: BindingExpression;
    iterator: BindingIdentifier;
    type: BindingType.ForOf;
}

interface BindingIfDirectiveNode extends BindingBaseNode {
    expression: BindingExpression;
    modifier: 'true' | 'false';
    type: BindingType.If;
}

type BindingDirectiveNode =
    | BindingForEachDirectiveNode
    | BindingForOfDirectiveNode
    | BindingIfDirectiveNode;

interface BindingBaseNode {
    children: BindingNode[];
}

interface BindingComponentNode extends BindingBaseNode {
    attributes: BindingAttribute[];
    tag: string;
    type: BindingType.Component;
}

interface BindingRootNode extends BindingBaseNode {
    type: BindingType.Root;
}

interface BindingSlotNode extends BindingBaseNode {
    name: string;
    type: BindingType.Slot;
}

type BindingNode = BindingComponentNode | BindingDirectiveNode | BindingSlotNode | BindingRootNode;

export interface BindingParseResult {
    root: BindingRootNode | undefined;
    warnings: CompilerDiagnostic[];
}

function pruneExpression(value: TemplateExpression): BindingExpression {
    if (isIdentifier(value)) {
        return {
            type: BindingType.Identifier,
            name: value.name,
        } as BindingIdentifier;
    }
    if (isMemberExpression(value)) {
        const {
            object,
            property: { name },
        } = value;
        return {
            type: BindingType.MemberExpression,
            object: pruneExpression(object as Identifier | MemberExpression),
            property: {
                type: BindingType.Identifier,
                name,
            },
        } as BindingMemberExpression;
    }
    throw new Error('Value must be either an identifier or member expression.');
}

function getAttributes(node: IRElement): BindingAttribute[] {
    const attrs = Object.assign({}, node.attrs, node.props);
    return Object.keys(attrs)
        .sort()
        .map(name => {
            const attr = attrs[name];
            if (attr.type === IRAttributeType.Boolean) {
                return {
                    type: BindingType.Boolean,
                    name: attr.name,
                    value: true,
                } as BindingBooleanAttribute;
            }
            if (attr.type === IRAttributeType.Expression) {
                return {
                    type: BindingType.Expression,
                    name: attr.name,
                    value: pruneExpression(attr.value),
                } as BindingExpressionAttribute;
            }
            if (attr.type === IRAttributeType.String) {
                return {
                    type: BindingType.String,
                    name: attr.name,
                    value: attr.value,
                } as BindingStringAttribute;
            }
            throw new Error('Attribute must be of type boolean, string, or expression.');
        });
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

// Returns a list of elements to be added to the AST in descending order
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

function transformToDirectiveNode(element: IRElement): BindingDirectiveNode {
    const { forEach, forOf, if: ifDirective, ifModifier } = element;
    if (forEach) {
        const { expression, index, item } = forEach;
        return {
            type: BindingType.ForEach,
            expression: pruneExpression(expression),
            index: index
                ? {
                      type: BindingType.Identifier,
                      name: index.name,
                  }
                : undefined,
            item: {
                type: BindingType.Identifier,
                name: item.name,
            },
            children: [],
        } as BindingForEachDirectiveNode;
    }
    if (forOf) {
        const {
            expression,
            iterator: { name },
        } = forOf;
        return {
            type: BindingType.ForOf,
            expression: pruneExpression(expression),
            iterator: {
                type: BindingType.Identifier,
                name,
            },
            children: [],
        } as BindingForOfDirectiveNode;
    }
    if (ifDirective && ifModifier) {
        const directive = element.if as TemplateAttributeValue;
        return {
            type: BindingType.If,
            expression: pruneExpression(directive),
            modifier: ifModifier,
            children: [],
        } as BindingIfDirectiveNode;
    }
    throw new Error('Element must have either a `for:each`, `iterator:*`, or `if` directive.');
}

function transformToSlotNode(element: IRElement): BindingSlotNode {
    if (isSlot(element)) {
        return {
            type: BindingType.Slot,
            name: element.slotName || '',
            children: [],
        };
    }
    throw new Error(`Expected <slot> element but received <${element.tag}> element.`);
}

function transformToComponentNode(element: IRElement): BindingComponentNode {
    const { component, tag } = element;
    if (component) {
        return {
            type: BindingType.Component,
            tag,
            attributes: getAttributes(element),
            children: [],
        };
    }
    throw new Error('Element must be associated with a component.');
}

function buildAST(rootIRElement: IRElement | undefined): BindingRootNode | undefined {
    if (isUndefined(rootIRElement)) {
        return undefined;
    }

    const astNodeMap = new WeakMap<IRElement, BindingNode>();
    astNodeMap.set(rootIRElement, {
        type: BindingType.Root,
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
    return astNodeMap.get(rootIRElement) as BindingRootNode;
}

export default function transform(parsedTemplate: TemplateParseResult): BindingParseResult {
    const { root, warnings } = parsedTemplate;
    return {
        root: buildAST(root),
        warnings,
    };
}
