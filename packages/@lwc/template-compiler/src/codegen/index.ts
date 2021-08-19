/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as astring from 'astring';

import { isBooleanAttribute } from '@lwc/shared';
import { TemplateErrors, generateCompilerError } from '@lwc/errors';

import { ResolvedConfig } from '../config';

import {
    isCommentNode,
    isElement,
    isCustomElement,
    isTemplate,
    isTextNode,
    isSlot,
} from '../shared/ir';
import { TEMPLATE_PARAMS, TEMPLATE_FUNCTION_NAME } from '../shared/constants';
import {
    IRNode,
    IRElement,
    IRText,
    IRAttribute,
    IRAttributeType,
    IRComment,
} from '../shared/types';

import CodeGen from './codegen';
import { bindExpression } from './scope';
import {
    identifierFromComponentName,
    objectToAST,
    shouldFlatten,
    memorizeHandler,
    containsDynamicChildren,
    parseClassNames,
    parseStyleText,
    hasIdAttribute,
    styleMapToStyleDeclsAST,
} from './helpers';

import { format as formatModule } from './formatters/module';
import { format as formatFunction } from './formatters/function';

import * as t from '../shared/estree';
import {
    isAllowedFragOnlyUrlsXHTML,
    isAttribute,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';
import { SVG_NAMESPACE_URI } from '../parser/constants';

function transform(codeGen: CodeGen): t.Expression {
    const parentStack: IRNode[] = [];

    function transformElement(element: IRElement): t.Expression {
        const databag = elementDataBag(element);
        let res: t.Expression;

        const children = transformChildren(element);

        // Check wether it has the special directive lwc:dynamic
        if (element.lwc && element.lwc.dynamic) {
            const expression = bindExpression(element.lwc.dynamic, element, parentStack);
            res = codeGen.genDynamicElement(element.tag, expression, databag, children);
        } else if (isCustomElement(element)) {
            // Make sure to register the component
            const componentClassName = element.component!;

            res = codeGen.genCustomElement(
                element.tag,
                identifierFromComponentName(componentClassName),
                databag,
                children
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;

            res = codeGen.getSlot(element.slotName!, databag, defaultSlot);
        } else {
            res = codeGen.genElement(element.tag, databag, children);
        }

        res = applyInlineIf(element, res);
        res = applyInlineFor(element, res);

        return res;
    }

    function transformTemplate(element: IRElement): t.Expression | t.Expression[] {
        const children = transformChildren(element);

        let res = applyTemplateIf(element, children);

        if (element.forEach) {
            res = applyTemplateFor(element, res);
        } else if (element.forOf) {
            res = applyTemplateForOf(element, res);
        }

        if (t.isArrayExpression(res) && element.if) {
            // The `if` transformation does not use the SpreadElement, neither null, therefore we can safely
            // typecast it to t.Expression[]
            return res.elements as t.Expression[];
        } else {
            return res;
        }
    }

    function transformText(consecutiveText: IRText[]): t.Expression {
        return codeGen.genText(
            consecutiveText.map((text) => {
                const { value } = text;

                return typeof value === 'string' ? value : bindExpression(value, text, parentStack);
            })
        );
    }

    function transformComment(comment: IRComment): t.Expression {
        return codeGen.genComment(comment.value);
    }

    function transformChildren(parent: IRElement): t.Expression {
        const res: t.Expression[] = [];
        const children = parent.children;
        const childrenIterator = children[Symbol.iterator]();
        let current: IteratorResult<IRNode>;

        parentStack.push(parent);

        while ((current = childrenIterator.next()) && !current.done) {
            let child = current.value;

            if (isTextNode(child)) {
                const continuousText: IRText[] = [];

                // Consume all the contiguous text nodes.
                do {
                    continuousText.push(child);
                    current = childrenIterator.next();
                    child = current.value;
                } while (!current.done && isTextNode(child));

                res.push(transformText(continuousText));

                // Early exit if a text node is the last child node.
                if (current.done) {
                    break;
                }
            }

            if (isElement(child)) {
                if (isTemplate(child)) {
                    const templateChildren = transformTemplate(child);
                    Array.isArray(templateChildren)
                        ? res.push(...templateChildren)
                        : res.push(templateChildren);
                } else {
                    res.push(transformElement(child));
                }
            }

            if (isCommentNode(child) && codeGen.preserveComments) {
                res.push(transformComment(child));
            }
        }

        parentStack.pop();

        if (shouldFlatten(children, codeGen)) {
            if (children.length === 1 && !containsDynamicChildren(children)) {
                return res[0];
            } else {
                return codeGen.genFlatten([t.arrayExpression(res)]);
            }
        } else {
            return t.arrayExpression(res);
        }
    }

    function applyInlineIf(
        element: IRElement,
        node: t.Expression,
        testExpression?: t.Expression,
        falseValue?: t.Expression
    ): t.Expression {
        if (!element.if) {
            return node;
        }

        if (!testExpression) {
            testExpression = bindExpression(element.if!, element, parentStack);
        }

        let leftExpression: t.Expression;
        const modifier = element.ifModifier!;
        if (modifier === 'true') {
            leftExpression = testExpression;
        } else if (modifier === 'false') {
            leftExpression = t.unaryExpression('!', testExpression);
        } else if (modifier === 'strict-true') {
            leftExpression = t.binaryExpression('===', testExpression, t.literal(true));
        } else {
            throw generateCompilerError(TemplateErrors.UNKNOWN_IF_MODIFIER, {
                messageArgs: [modifier],
            });
        }

        return t.conditionalExpression(leftExpression, node, falseValue ?? t.literal(null));
    }

    function applyInlineFor(element: IRElement, node: t.Expression) {
        if (!element.forEach) {
            return node;
        }

        const { expression, item, index } = element.forEach;
        const params = [item];
        if (index) {
            params.push(index);
        }

        const iterable = bindExpression(expression, element, parentStack);
        const iterationFunction = t.functionExpression(
            null,
            params,
            t.blockStatement([t.returnStatement(node)])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyInlineForOf(element: IRElement, node: t.Expression) {
        if (!element.forOf) {
            return node;
        }

        const { expression, iterator } = element.forOf;
        const { name: iteratorName } = iterator;

        const argsMapping = {
            value: `${iteratorName}Value`,
            index: `${iteratorName}Index`,
            first: `${iteratorName}First`,
            last: `${iteratorName}Last`,
        };

        const iteratorArgs = Object.values(argsMapping).map((arg) => t.identifier(arg));
        const iteratorObjet = t.objectExpression(
            Object.entries(argsMapping).map(([prop, arg]) =>
                t.property(t.identifier(prop), t.identifier(arg))
            )
        );

        const iterable = bindExpression(expression, element, parentStack);
        const iterationFunction = t.functionExpression(
            null,
            iteratorArgs,
            t.blockStatement([
                t.variableDeclaration('const', [
                    t.variableDeclarator(t.identifier(iteratorName), iteratorObjet),
                ]),
                t.returnStatement(node),
            ])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyTemplateForOf(element: IRElement, fragmentNodes: t.Expression) {
        let expression = fragmentNodes;
        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        return applyInlineForOf(element, expression);
    }

    function applyTemplateFor(element: IRElement, fragmentNodes: t.Expression): t.Expression {
        let expression = fragmentNodes;
        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        return applyInlineFor(element, expression);
    }

    function applyTemplateIf(element: IRElement, fragmentNodes: t.Expression): t.Expression {
        if (!element.if) {
            return fragmentNodes;
        }

        if (t.isArrayExpression(fragmentNodes)) {
            // Bind the expression once for all the template children
            const testExpression = bindExpression(element.if!, element, parentStack);

            return t.arrayExpression(
                fragmentNodes.elements.map((child) =>
                    child !== null
                        ? applyInlineIf(element, child as t.Expression, testExpression)
                        : null
                )
            );
        } else {
            // If the template has a single children, make sure the ternary expression returns an array
            return applyInlineIf(element, fragmentNodes, undefined, t.arrayExpression([]));
        }
    }

    function computeAttrValue(attr: IRAttribute, element: IRElement): t.Expression {
        const { tag, namespace } = element;
        const isUsedAsAttribute = isAttribute(element, attr.name);

        switch (attr.type) {
            case IRAttributeType.Expression: {
                const expression = bindExpression(attr.value, element, parentStack);

                // TODO [#2012]: Normalize global boolean attrs values passed to custom elements as props
                if (isUsedAsAttribute && isBooleanAttribute(attr.name, tag)) {
                    // We need to do some manipulation to allow the diffing algorithm add/remove the attribute
                    // without handling special cases at runtime.
                    return codeGen.genBooleanAttributeExpr(expression);
                }
                if (attr.name === 'tabindex') {
                    return codeGen.genTabIndex([expression]);
                }
                if (attr.name === 'id' || isIdReferencingAttribute(attr.name)) {
                    return codeGen.genScopedId(expression);
                }
                if (
                    codeGen.scopeFragmentId &&
                    isAllowedFragOnlyUrlsXHTML(tag, attr.name, namespace)
                ) {
                    return codeGen.genScopedFragId(expression);
                }
                if (isSvgUseHref(tag, attr.name, namespace)) {
                    codeGen.usedLwcApis.add('sanitizeAttribute');

                    return t.callExpression(t.identifier('sanitizeAttribute'), [
                        t.literal(tag),
                        t.literal(namespace),
                        t.literal(attr.name),
                        codeGen.genScopedFragId(expression),
                    ]);
                }

                return expression;
            }

            case IRAttributeType.String: {
                if (attr.name === 'id') {
                    return codeGen.genScopedId(attr.value);
                }
                if (attr.name === 'spellcheck') {
                    return t.literal(attr.value.toLowerCase() !== 'false');
                }

                if (!isUsedAsAttribute && isBooleanAttribute(attr.name, tag)) {
                    // We are in presence of a string value, for a recognized boolean attribute, which is used as
                    // property. for these cases, always set the property to true.
                    return t.literal(true);
                }

                if (isIdReferencingAttribute(attr.name)) {
                    return codeGen.genScopedId(attr.value);
                }
                if (
                    codeGen.scopeFragmentId &&
                    isAllowedFragOnlyUrlsXHTML(tag, attr.name, namespace) &&
                    isFragmentOnlyUrl(attr.value)
                ) {
                    return codeGen.genScopedFragId(attr.value);
                }
                if (isSvgUseHref(tag, attr.name, namespace)) {
                    codeGen.usedLwcApis.add('sanitizeAttribute');

                    return t.callExpression(t.identifier('sanitizeAttribute'), [
                        t.literal(tag),
                        t.literal(namespace),
                        t.literal(attr.name),
                        isFragmentOnlyUrl(attr.value)
                            ? codeGen.genScopedFragId(attr.value)
                            : t.literal(attr.value),
                    ]);
                }
                return t.literal(attr.value);
            }

            case IRAttributeType.Boolean: {
                // A boolean value used in an attribute should always generate .setAttribute(attr.name, ''),
                // regardless if is a boolean attribute or not.
                return isUsedAsAttribute ? t.literal('') : t.literal(attr.value);
            }
        }
    }

    function elementDataBag(element: IRElement): t.ObjectExpression {
        const data: t.Property[] = [];

        const { attrs, props, on, forKey, lwc } = element;

        // Attributes
        if (attrs) {
            const rest: { [name: string]: t.Expression } = {};

            for (const [name, value] of Object.entries(attrs)) {
                if (name === 'class') {
                    // Handle class attribute:
                    // - expression values are turned into a `className` property.
                    // - string values are parsed and turned into a `classMap` object associating
                    //   each individual class name with a `true` boolean.
                    if (value.type === IRAttributeType.Expression) {
                        const classExpression = bindExpression(value.value, element, parentStack);
                        data.push(t.property(t.identifier('className'), classExpression));
                    } else if (value.type === IRAttributeType.String) {
                        const classNames = parseClassNames(value.value);
                        const classMap = t.objectExpression(
                            classNames.map((name) => t.property(t.literal(name), t.literal(true)))
                        );
                        data.push(t.property(t.identifier('classMap'), classMap));
                    }
                } else if (name === 'style') {
                    // Handle style attribute:
                    // - expression values are turned into a `style` property.
                    // - string values are parsed and turned into a `styles` array
                    // containing triples of [name, value, important (optional)]
                    if (value.type === IRAttributeType.Expression) {
                        const styleExpression = bindExpression(value.value, element, parentStack);
                        data.push(t.property(t.identifier('style'), styleExpression));
                    } else if (value.type === IRAttributeType.String) {
                        const styleMap = parseStyleText(value.value);
                        const styleAST = styleMapToStyleDeclsAST(styleMap);
                        data.push(t.property(t.identifier('styleDecls'), styleAST));
                    }
                } else {
                    rest[name] = computeAttrValue(attrs[name], element);
                }
            }

            // Add all the remaining attributes to an `attrs` object where the key is the attribute
            // name and the value is the computed attribute value.
            if (Object.keys(rest).length) {
                const attrsObj = objectToAST(rest, (key) => rest[key]);
                data.push(t.property(t.identifier('attrs'), attrsObj));
            }
        }

        // Properties
        if (props) {
            const propsObj = objectToAST(props, (key) => computeAttrValue(props[key], element));
            data.push(t.property(t.identifier('props'), propsObj));
        }

        // Context
        if (lwc?.dom) {
            const contextObj = t.objectExpression([
                t.property(
                    t.identifier('lwc'),
                    t.objectExpression([t.property(t.identifier('dom'), t.literal(lwc.dom))])
                ),
            ]);
            data.push(t.property(t.identifier('context'), contextObj));
        }

        // Key property on VNode
        if (forKey) {
            // If element has user-supplied `key` or is in iterator, call `api.k`
            const forKeyExpression = bindExpression(forKey, element, parentStack);
            const generatedKey = codeGen.genKey(t.literal(codeGen.generateKey()), forKeyExpression);
            data.push(t.property(t.identifier('key'), generatedKey));
        } else {
            // If stand alone element with no user-defined key
            // member expression id
            data.push(t.property(t.identifier('key'), t.literal(codeGen.generateKey())));
        }

        // Event handler
        if (on) {
            const onObj = objectToAST(on, (key) => {
                const componentHandler = bindExpression(on[key], element, parentStack);
                const handler = codeGen.genBind(componentHandler);

                return memorizeHandler(codeGen, element, parentStack, componentHandler, handler);
            });
            data.push(t.property(t.identifier('on'), onObj));
        }

        // SVG handling
        if (element.namespace === SVG_NAMESPACE_URI) {
            data.push(t.property(t.identifier('svg'), t.literal(true)));
        }

        return t.objectExpression(data);
    }

    return transformChildren(codeGen.root);
}

function generateTemplateFunction(codeGen: CodeGen): t.FunctionDeclaration {
    const returnedValue = transform(codeGen);

    const args = [
        TEMPLATE_PARAMS.API,
        TEMPLATE_PARAMS.INSTANCE,
        TEMPLATE_PARAMS.SLOT_SET,
        TEMPLATE_PARAMS.CONTEXT,
    ].map((id) => t.identifier(id));

    const body: t.Statement[] = [
        t.variableDeclaration('const', [
            t.variableDeclarator(
                t.objectPattern(
                    Object.keys(codeGen.usedApis).map((name) =>
                        t.assignmentProperty(t.identifier(name), codeGen.usedApis[name])
                    )
                ),
                t.identifier(TEMPLATE_PARAMS.API)
            ),
        ]),
    ];

    if (Object.keys(codeGen.usedSlots).length) {
        body.push(
            t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.objectPattern(
                        Object.keys(codeGen.usedApis).map((name) =>
                            t.assignmentProperty(t.literal(name), codeGen.usedSlots[name], {
                                computed: true,
                            })
                        )
                    ),
                    t.identifier(TEMPLATE_PARAMS.SLOT_SET)
                ),
            ])
        );
    }

    if (codeGen.memorizedIds.length) {
        body.push(
            t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.objectPattern(
                        codeGen.memorizedIds.map((id) =>
                            t.assignmentProperty(id, id, { shorthand: true })
                        )
                    ),
                    t.identifier(TEMPLATE_PARAMS.CONTEXT)
                ),
            ])
        );
    }

    body.push(t.returnStatement(returnedValue));

    return t.functionDeclaration(
        t.identifier(TEMPLATE_FUNCTION_NAME),
        args,
        t.blockStatement(body)
    );
}

export default function (root: IRElement, config: ResolvedConfig): string {
    const scopeFragmentId = hasIdAttribute(root);
    const codeGen = new CodeGen({
        root,
        config,
        scopeFragmentId,
    });

    const templateFunction = generateTemplateFunction(codeGen);

    let program: t.Program;
    switch (config.format) {
        case 'function':
            program = formatFunction(templateFunction, codeGen);
            break;

        case 'module':
            program = formatModule(templateFunction, codeGen);
            break;
    }

    return astring.generate(program);
}
