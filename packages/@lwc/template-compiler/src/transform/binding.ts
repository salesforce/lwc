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
    children: Array<BindingASTComponentNode | BindingASTDirectiveNode>;
    type: 'BindingASTNode';
}

interface BindingASTComponentNode {
    attributes: BindingASTAttribute[];
    children: Array<BindingASTComponentNode | BindingASTDirectiveNode>;
    component: true;
    tag: string;
    type: 'BindingASTComponentNode';
}

interface BindingASTDirectiveNode {
    children: Array<BindingASTComponentNode | BindingASTDirectiveNode>;
    forEach?: {
        expression: BindingASTIdentifier | BindingASTMemberExpression;
        index?: BindingASTIdentifier | undefined;
        item: BindingASTIdentifier;
    };
    forOf?: {
        expression: BindingASTIdentifier | BindingASTMemberExpression;
        iterator: BindingASTIdentifier;
    };
    type: 'BindingASTDirectiveNode';
}

export interface BindingParseResult {
    root: BindingASTNode | undefined;
    warnings: CompilerDiagnostic[];
}

function hasExpressionAttribute(node: IRElement) {
    const { props = {} } = node;
    return Object.values(props).some(isExpressionAttribute);
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

// Returns a list of component elements with one or more attribute expressions.
// Components without attribute expressions will not be in the AST.
function collectBindingASTComponents(rootElement: IRElement): IRElement[] {
    const components: IRElement[] = [];
    function depthFirstCollect(element: IRElement) {
        if (element.children) {
            element.children.forEach(depthFirstCollect);
        }
        if (element.component && hasExpressionAttribute(element)) {
            components.push(element);
        }
    }
    depthFirstCollect(rootElement);
    return components;
}

function hasDirective(element: IRElement): boolean {
    return Boolean(element.forEach || element.forOf);
}

// Returns a list of elements to be added to the AST in top-down order
function getPrunedPath(component: IRElement, components: IRElement[]): IRElement[] {
    function prune(elm: IRElement, path: IRElement[]) {
        if (isUndefined(elm.parent)) {
            // Base case: root element
            return [elm, ...path];
        }
        if (hasDirective(elm) || components.includes(elm)) {
            path = [elm, ...path];
        }
        return prune(elm.parent, path);
    }
    // `component.parent!` because components from a parsed template always have a parent
    return prune(component.parent!, [component]);
}

function transformToASTDirectiveNode(element: IRElement): BindingASTDirectiveNode {
    const { forEach, forOf } = element;
    if (forEach) {
        const expression = forEach.expression as BabelTemplateExpression;
        return {
            type: 'BindingASTDirectiveNode',
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
            type: 'BindingASTDirectiveNode',
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
    throw new Error('Element must have either a for:each or iterator:* directive.');
}

function transformToASTComponentNode(element: IRElement): BindingASTComponentNode {
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

    const astNodeMap = new WeakMap<IRElement, BindingASTComponentNode | BindingASTDirectiveNode>();
    const ast: BindingASTNode = {
        type: 'BindingASTNode',
        children: [],
    };

    const components = collectBindingASTComponents(rootIRElement);
    components.forEach(component => {
        // Top-down path
        const prunedPath = getPrunedPath(component, components);
        const [, ...ancestors] = prunedPath;
        // Only the root node and directive nodes can have children in this AST.
        let parentASTNode: BindingASTNode | BindingASTComponentNode | BindingASTDirectiveNode = ast;
        ancestors.forEach(currentElement => {
            // If the current element does not have a node representation in the AST.
            if (!astNodeMap.has(currentElement)) {
                if (currentElement.component) {
                    const componentNode = transformToASTComponentNode(currentElement);
                    // If the component has an inline directive, then lift the directive up into a
                    // "virtual" directive node and add the component node as a child.
                    if (hasDirective(currentElement)) {
                        const directiveNode = transformToASTDirectiveNode(currentElement);
                        parentASTNode.children.push(directiveNode);
                        directiveNode.children.push(componentNode);
                        parentASTNode = directiveNode;
                    } else {
                        parentASTNode.children.push(componentNode);
                    }
                    astNodeMap.set(currentElement, componentNode);
                } else {
                    const directiveNode = transformToASTDirectiveNode(currentElement);
                    parentASTNode.children.push(directiveNode);
                    astNodeMap.set(currentElement, directiveNode);
                    parentASTNode = directiveNode;
                }
            }
        });
    });
    return ast;
}

export default function transform(parsedTemplate: TemplateParseResult): BindingParseResult {
    const { root, warnings } = parsedTemplate;
    return {
        root: buildAST(root),
        warnings,
    };
}
