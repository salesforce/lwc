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

interface BindingASTTemplateExpression {
    type: 'BindingASTTemplateExpression';
    value: BindingASTIdentifier | BindingASTMemberExpression;
}

interface BindingASTAttribute {
    expression: BindingASTTemplateExpression;
    name: string;
    type: 'BindingASTAttribute';
}

interface BindingASTNode {
    attributes: BindingASTAttribute[];
    children: BindingASTNode[];
    component: boolean;
    forEach?: {
        expression: BindingASTTemplateExpression;
        index?: BindingASTIdentifier | undefined;
        item: BindingASTIdentifier;
    };
    forOf?: {
        expression: BindingASTTemplateExpression;
        iterator: BindingASTIdentifier;
    };
    tag: string;
    type: 'BindingASTNode';
}

export interface BindingParseResult {
    root: BindingASTNode | undefined;
    warnings: CompilerDiagnostic[];
}

function hasExpressionAttribute(props) {
    return Object.values(props).some(isExpressionAttribute);
}

function isExpressionAttribute(attr) {
    return attr.type === IRAttributeType.Expression;
}

function pruneExpression(attr: BabelTemplateExpression): BindingASTTemplateExpression {
    return {
        type: 'BindingASTTemplateExpression',
        value: babelTypes.isIdentifier(attr)
            ? {
                  type: 'BindingASTIdentifier',
                  name: attr.name,
              }
            : pruneMemberExpression(attr),
    };
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

// Returns a WeakSet containing component elements with one or more attribute
// expressions, along with their ancestor elements. The binding AST will be a
// pruned AST composed of elements in this set.
function collectBindingAstNodes(node: IRElement): WeakSet<IRElement> {
    const set: WeakSet<IRElement> = new WeakSet();
    function collect(node: IRElement) {
        if (node.component && node.props && hasExpressionAttribute(node.props)) {
            let bindingAstNode = node;
            set.add(bindingAstNode);
            while (bindingAstNode.parent && !set.has(bindingAstNode.parent)) {
                bindingAstNode = bindingAstNode.parent;
                set.add(bindingAstNode);
            }
        }
        if (node.children) {
            node.children.forEach(collect);
        }
    }
    collect(node);
    return set;
}

function buildBindingAst(node: IRElement | undefined): BindingASTNode | undefined {
    if (isUndefined(node)) {
        return undefined;
    }
    const subtreeSet = collectBindingAstNodes(node);
    function build(astNode: IRElement, bindingAstNode: BindingASTNode) {
        const filteredNodes = astNode.children.filter(
            subtreeSet.has.bind(subtreeSet)
        ) as IRElement[];
        bindingAstNode.children = filteredNodes.map(filteredNode => {
            const { component, forEach, forOf, tag } = filteredNode;
            const node: BindingASTNode = {
                type: 'BindingASTNode',
                tag,
                component: Boolean(component),
                attributes: [],
                children: [],
            };
            if (forEach) {
                const expression = forEach.expression as BabelTemplateExpression;
                node.forEach = {
                    expression: pruneExpression(expression),
                    item: {
                        type: 'BindingASTIdentifier',
                        name: forEach.item.name,
                    },
                };
                if (forEach.index) {
                    node.forEach.index = {
                        type: 'BindingASTIdentifier',
                        name: forEach.index.name,
                    };
                }
            }
            if (forOf) {
                const expression = forOf.expression as BabelTemplateExpression;
                node.forOf = {
                    expression: pruneExpression(expression),
                    iterator: {
                        type: 'BindingASTIdentifier',
                        name: forOf.iterator.name,
                    },
                };
            }
            if (component) {
                node.attributes = getExpressionAttributes(filteredNode);
            }
            return node;
        });
        filteredNodes.forEach((node, index) => {
            build(node, bindingAstNode.children[index]);
        });
    }
    const root: BindingASTNode = {
        type: 'BindingASTNode',
        tag: node.tag,
        component: false,
        attributes: [],
        children: [],
    };
    build(node, root);
    return root;
}

export default function transform(parsedTemplate: TemplateParseResult): BindingParseResult {
    const { root, warnings } = parsedTemplate;
    return {
        root: buildBindingAst(root),
        warnings,
    };
}
