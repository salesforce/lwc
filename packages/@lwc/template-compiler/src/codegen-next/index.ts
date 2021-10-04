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
    isCustomElement,
    isTemplate,
    isTextNode,
    isSlot,
    isStringLiteral,
    isForBlock,
    isIfBlock,
    isForEach,
    isBaseElement,
    isDynamicDirective,
    isExpression,
    isRoot,
    isProperty,
    getElementDirective,
    getKeyDirective,
    getDomDirective,
} from '../shared-next/ir';
import { TEMPLATE_PARAMS, TEMPLATE_FUNCTION_NAME } from '../shared-next/constants';
import {
    Root,
    ParentNode,
    ChildNode,
    Text,
    IfBlock,
    ForBlock,
    ForEach,
    Slot,
    Component,
    Element,
    Attribute,
    Property,
    Comment,
    ForOf,
} from '../shared-next/types';

import CodeGen from './codegen';
import Scope from './scope';
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
    arrayToObjectAST,
} from './helpers';

import { format as formatModule } from './formatters/module';
import { format as formatFunction } from './formatters/function';

import * as t from '../shared-next/estree';
import {
    isAllowedFragOnlyUrlsXHTML,
    isAttribute,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
    propertyNameToAttribute,
} from '../parser-next/attribute';
import { SVG_NAMESPACE_URI } from '../parser-next/constants';

function transform(codeGen: CodeGen, scope: Scope): t.Expression {
    function transformElement(element: Element | Component | Slot): t.Expression {
        const databag = elementDataBag(element);
        let res: t.Expression;

        const children = transformChildren(element);

        // Check wether it has the special directive lwc:dynamic
        const { name } = element;
        // jtu: there's probably a better way to do this
        const dynamic = getElementDirective(element, isDynamicDirective);
        if (dynamic) {
            const expression = scope.bindExpression(dynamic.value);
            res = codeGen.genDynamicElement(name, expression, databag, children);
        } else if (isCustomElement(element)) {
            // Make sure to register the component
            const componentClassName = name;

            // jtu: come back to this, originally it was element.tag, is there a difference between name and tag?
            res = codeGen.genCustomElement(
                name,
                identifierFromComponentName(componentClassName),
                databag,
                children
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;

            // jtu:  the name may need to be taken from the attributes depending on if
            // the name for slots is the tag name.
            res = codeGen.getSlot(name, databag, defaultSlot);
        } else {
            res = codeGen.genElement(name, databag, children);
        }

        // res = applyInlineIf(element, res);
        // res = applyInlineFor(element, res);

        return res;
    }

    function transformTemplate(element: Element | Component | Slot): t.Expression | t.Expression[] {
        const children = transformChildren(element);
        // jtu: come back to ths one I think it's ok but just double check
        // return t.isArrayExpression(children) ? (children.elements as t.Expression[]) : children;
        return children;

        // let res = applyTemplateIf(element, children);

        // if (element.forEach) {
        //     res = applyTemplateFor(element, res);
        // } else if (element.forOf) {
        //     res = applyTemplateForOf(element, res);
        // }

        // // jtu: need to come back to this one, so basically we're saying that for array expressions, when it's an if we need to
        // // return the res.elements
        // if (t.isArrayExpression(res) && element.if) {
        //     // The `if` transformation does not use the SpreadElement, neither null, therefore we can safely
        //     // typecast it to t.Expression[]
        //     return res.elements as t.Expression[];
        // } else {
        //     return res;
        // }
    }

    function transformText(consecutiveText: Text[]): t.Expression {
        return codeGen.genText(
            consecutiveText.map((text) => {
                const { value } = text;

                // jtu: come back to this, I dunno if you should be able to pass a boolean to scope.bindExpression
                return isStringLiteral(value) ? value.value : scope.bindExpression(value);
            })
        );
    }

    function transformComment(comment: Comment): t.Expression {
        return codeGen.genComment(comment.value);
    }

    function transformChildren(parent: ParentNode): t.Expression {
        const res: t.Expression[] = [];
        const children = parent.children;
        const childrenIterator = children[Symbol.iterator]();
        let current: IteratorResult<ChildNode>;

        while ((current = childrenIterator.next()) && !current.done) {
            let child = current.value;

            if (isTextNode(child)) {
                const continuousText: Text[] = [];

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

            // jtu: need to modify, if there is a array expression and a if block in the results, we need to
            // return the res.element instead
            if (isForBlock(child)) {
                res.push(transformForBlock(child));
            }

            if (isIfBlock(child)) {
                const ifBlockChildren = transformIf(child);
                Array.isArray(ifBlockChildren)
                    ? res.push(...ifBlockChildren)
                    : res.push(ifBlockChildren);
                // res.push(transformIf(child));
            }

            if (isBaseElement(child)) {
                if (isTemplate(child)) {
                    // jtu: two options, either we elimnate the need for an element in the IR when there's a template and for or if
                    // or we just call the transformTemplate on the IR element and have it just return the children
                    // Keep it the same for now, look into changing this later.
                    // jtu com eback to this right now it'll only return a single Expression
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

        // jtu: come back to this root should be a valid entry too
        if ((isRoot(parent) || isBaseElement(parent)) && shouldFlatten(children, codeGen)) {
            if (children.length === 1 && !containsDynamicChildren(children)) {
                return res[0];
            } else {
                return codeGen.genFlatten([t.arrayExpression(res)]);
            }
        } else {
            return t.arrayExpression(res);
        }
    }

    function transformIf(ifBlock: IfBlock): t.Expression | t.Expression[] {
        const children = transformChildren(ifBlock);

        // jtu: definitely need to come back and look at this
        // first time to unwrap the child from either if or element
        let expression = children;
        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        // jtu: com eback to this one, may be able to simply more
        let res: t.Expression;
        if (isTemplate(ifBlock)) {
            res = applyTemplateIf(ifBlock, expression);
        } else {
            let expression = children;
            if (t.isArrayExpression(expression) && expression.elements.length === 1) {
                expression = expression.elements[0] as t.Expression;
            }

            // jtu:  The current AST structure, the if will only have one child, which is the element.
            res = applyInlineIf(ifBlock, expression);
        }

        if (t.isArrayExpression(res)) {
            // The `if` transformation does not use the SpreadElement, neither null, therefore we can safely
            // typecast it to t.Expression[]
            return res.elements as t.Expression[];
        }

        return res;
    }

    function applyInlineIf(
        ifBlock: IfBlock,
        node: t.Expression,
        testExpression?: t.Expression,
        falseValue?: t.Expression
    ) {
        if (!testExpression) {
            testExpression = scope.bindExpression(ifBlock.condition);
        }

        let leftExpression: t.Expression;
        const modifier = ifBlock.modifier!;
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

    function transformForBlock(forBlock: ForBlock) {
        scope.beginScope();

        if (isForEach(forBlock)) {
            scope.declare(forBlock.item);
            if (forBlock.index) {
                scope.declare(forBlock.index);
            }
        } else {
            scope.declare(forBlock.iterator);
        }
        const children = transformChildren(forBlock);
        scope.endScope();

        let expression = children;

        // first time to unwrap the child from either if or element
        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        // jtu:  Template has potential for array expression to come back with more than one element in expression.element
        let res: t.Expression;
        if (isForEach(forBlock)) {
            res = applyInlineFor(forBlock, expression);
        } else {
            res = applyInlineForOf(forBlock, expression);
        }

        return res;
    }

    // function applyTemplateForBlock(forBlock: ForBlock, fragmentNodes: t.Expression) {
    //     let expression = fragmentNodes;
    //     if (t.isArrayExpression(expression) && expression.elements.length === 1) {
    //         expression = expression.elements[0] as t.Expression;
    //     }

    //     let res: t.Expression;
    //     if (isForEach(forBlock)) {
    //         res = applyTemplateFor(forBlock, expression);
    //     } else {
    //         res = applyTemplateForOf(forBlock, expression);
    //     }

    //     return res;
    // }

    // function applyInlineForBlock(forBlock: ForBlock, fragmentNodes: t.Expression) {
    //     let expression = fragmentNodes;
    //     if (t.isArrayExpression(expression) && expression.elements.length === 1) {
    //         expression = expression.elements[0] as t.Expression;
    //     }

    //     let res: t.Expression;
    //     if (isForEach(forBlock)) {
    //         res = applyInlineFor(forBlock, expression);
    //     } else {
    //         res = applyInlineForOf(forBlock, expression);
    //     }

    //     return res;
    // }

    function applyInlineFor(forEach: ForEach, node: t.Expression) {
        const { expression, item, index } = forEach;
        const params = [item];
        if (index) {
            params.push(index);
        }

        const iterable = scope.bindExpression(expression);
        const iterationFunction = t.functionExpression(
            null,
            params,
            t.blockStatement([t.returnStatement(node)])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyInlineForOf(forOf: ForOf, node: t.Expression) {
        const { expression, iterator } = forOf;
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

        const iterable = scope.bindExpression(expression);
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

    // function applyTemplateForOf(element: IRElement, fragmentNodes: t.Expression) {
    //     let expression = fragmentNodes;
    //     if (t.isArrayExpression(expression) && expression.elements.length === 1) {
    //         expression = expression.elements[0] as t.Expression;
    //     }

    //     return applyInlineForOf(element, expression);
    // }

    // function applyTemplateFor(element: IRElement, fragmentNodes: t.Expression) {
    //     let expression = fragmentNodes;
    //     if (t.isArrayExpression(expression) && expression.elements.length === 1) {
    //         expression = expression.elements[0] as t.Expression;
    //     }

    //     return applyInlineFor(element, expression);
    // }

    function applyTemplateIf(ifBlock: IfBlock, fragmentNodes: t.Expression): t.Expression {
        if (t.isArrayExpression(fragmentNodes)) {
            // Bind the expression once for all the template children
            const testExpression = scope.bindExpression(ifBlock.condition);

            return t.arrayExpression(
                fragmentNodes.elements.map((child) =>
                    child !== null
                        ? applyInlineIf(ifBlock, child as t.Expression, testExpression)
                        : null
                )
            );
        } else {
            // If the template has a single children, make sure the ternary expression returns an array
            return applyInlineIf(ifBlock, fragmentNodes, undefined, t.arrayExpression([]));
        }
    }

    function computeAttrValue(
        attr: Attribute | Property,
        element: Element | Component | Slot
    ): t.Expression {
        const { name: elmName, namespace = '' } = element;
        const { name, value: attrValue } = attr;
        // Properties have names camel cased
        const attrName = isProperty(attr) ? propertyNameToAttribute(name) : name;
        const isUsedAsAttribute = isAttribute(element, attrName);

        if (isExpression(attrValue)) {
            const expression = scope.bindExpression(attrValue);

            // TODO [#2012]: Normalize global boolean attrs values passed to custom elements as props
            if (isUsedAsAttribute && isBooleanAttribute(attrName, elmName)) {
                // We need to do some manipulation to allow the diffing algorithm add/remove the attribute
                // without handling special cases at runtime.
                return codeGen.genBooleanAttributeExpr(expression);
            }
            if (attrName === 'tabindex') {
                return codeGen.genTabIndex([expression]);
            }
            if (attrName === 'id' || isIdReferencingAttribute(attrName)) {
                return codeGen.genScopedId(expression);
            }
            if (
                codeGen.scopeFragmentId &&
                isAllowedFragOnlyUrlsXHTML(elmName, attrName, namespace)
            ) {
                return codeGen.genScopedFragId(expression);
            }
            if (isSvgUseHref(elmName, attrName, namespace)) {
                codeGen.usedLwcApis.add('sanitizeAttribute');

                return t.callExpression(t.identifier('sanitizeAttribute'), [
                    t.literal(elmName),
                    t.literal(namespace),
                    t.literal(attrName),
                    codeGen.genScopedFragId(expression),
                ]);
            }

            return expression;
        } else if (isStringLiteral(attrValue)) {
            if (attrName === 'id') {
                return codeGen.genScopedId(attrValue.value);
            }
            if (attrName === 'spellcheck') {
                return t.literal(attrValue.value.toLowerCase() !== 'false');
            }

            if (!isUsedAsAttribute && isBooleanAttribute(attrName, elmName)) {
                // We are in presence of a string value, for a recognized boolean attribute, which is used as
                // property. for these cases, always set the property to true.
                return t.literal(true);
            }

            if (isIdReferencingAttribute(attrName)) {
                return codeGen.genScopedId(attrValue.value);
            }
            if (
                codeGen.scopeFragmentId &&
                isAllowedFragOnlyUrlsXHTML(elmName, attrName, namespace) &&
                isFragmentOnlyUrl(attrValue.value)
            ) {
                return codeGen.genScopedFragId(attrValue.value);
            }
            if (isSvgUseHref(elmName, attrName, namespace)) {
                codeGen.usedLwcApis.add('sanitizeAttribute');

                return t.callExpression(t.identifier('sanitizeAttribute'), [
                    t.literal(elmName),
                    t.literal(namespace),
                    t.literal(attrName),
                    isFragmentOnlyUrl(attrValue.value)
                        ? codeGen.genScopedFragId(attrValue.value)
                        : t.literal(attrValue.value),
                ]);
            }
            return t.literal(attrValue.value);
        } else {
            // A boolean value used in an attribute should always generate .setAttribute(attr.name, ''),
            // regardless if is a boolean attribute or not.
            return isUsedAsAttribute ? t.literal('') : t.literal(attrValue.value);
        }
    }

    function elementDataBag(element: Element | Component | Slot): t.ObjectExpression {
        const data: t.Property[] = [];

        const { attributes, properties, listeners } = element;
        const dom = getDomDirective(element);
        const forKey = getKeyDirective(element);

        // Attributes
        if (attributes.length) {
            const rest: { [name: string]: t.Expression } = {};

            for (const attr of attributes) {
                const { name, value } = attr;
                if (name === 'class') {
                    // Handle class attribute:
                    // - expression values are turned into a `className` property.
                    // - string values are parsed and turned into a `classMap` object associating
                    //   each individual class name with a `true` boolean.
                    if (isExpression(value)) {
                        const classExpression = scope.bindExpression(value);
                        data.push(t.property(t.identifier('className'), classExpression));
                    } else if (isStringLiteral(value)) {
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
                    if (isExpression(value)) {
                        const styleExpression = scope.bindExpression(value);
                        data.push(t.property(t.identifier('style'), styleExpression));
                    } else if (isStringLiteral(value)) {
                        const styleMap = parseStyleText(value.value);
                        const styleAST = styleMapToStyleDeclsAST(styleMap);
                        data.push(t.property(t.identifier('styleDecls'), styleAST));
                    }
                } else {
                    rest[name] = computeAttrValue(attr, element);
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
        if (properties.length) {
            // jtu: probably think of a new name for this or replace with reduce
            // const props = arrayToObjectAST(properties, (prop) => prop.name);
            // const propsObj = objectToAST(props, (key) => computeAttrValue(props[key], element));
            const propsObj = arrayToObjectAST(
                properties,
                (prop) => prop.name,
                (prop) => computeAttrValue(prop, element)
            );
            data.push(t.property(t.identifier('props'), propsObj));
        }

        // Context
        if (dom) {
            const contextObj = t.objectExpression([
                t.property(
                    t.identifier('lwc'),
                    t.objectExpression([
                        t.property(t.identifier('dom'), t.literal(dom.value.value)),
                    ])
                ),
            ]);
            data.push(t.property(t.identifier('context'), contextObj));
        }

        // Key property on VNode
        if (forKey) {
            // If element has user-supplied `key` or is in iterator, call `api.k`
            const forKeyExpression = scope.bindExpression(forKey.value);
            const generatedKey = codeGen.genKey(t.literal(codeGen.generateKey()), forKeyExpression);
            data.push(t.property(t.identifier('key'), generatedKey));
        } else {
            // If stand alone element with no user-defined key
            // member expression id
            data.push(t.property(t.identifier('key'), t.literal(codeGen.generateKey())));
        }

        // Event handler
        if (listeners.length) {
            // const listenerObj = arrayToObjectAST(listeners, (listener) => listener.name)
            // const listenerObj = listeners.reduce((obj, val) => (obj[val.name] = val), {});
            // const onObj = objectToAST(listenerObj, (key) => {
            //     const componentHandler = scope.bindExpression(listenerObj[key].handler);
            //     const handler = codeGen.genBind(componentHandler);

            //     return memorizeHandler(codeGen, scope, componentHandler, handler);
            // });

            // jtu: come back to this, dunno if I want to keep it like this.  Main reason is the need for the key mapper
            // seems like it's unneccesary to turn into a obj only to turn it back into an array again
            // seems unnecessary to need to require a key mapper too.
            const listnerObj = arrayToObjectAST(
                listeners,
                (listener) => listener.name,
                (listener) => {
                    const componentHandler = scope.bindExpression(listener.handler);
                    const handler = codeGen.genBind(componentHandler);

                    return memorizeHandler(codeGen, scope, componentHandler, handler);
                }
            );
            data.push(t.property(t.identifier('on'), listnerObj));
        }

        // SVG handling
        if (element.namespace === SVG_NAMESPACE_URI) {
            data.push(t.property(t.identifier('svg'), t.literal(true)));
        }

        return t.objectExpression(data);
    }

    return transformChildren(codeGen.root);
}

function generateTemplateFunction(codeGen: CodeGen, scope: Scope): t.FunctionDeclaration {
    const returnedValue = transform(codeGen, scope);

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

export default function (root: Root, config: ResolvedConfig): string {
    const scopeFragmentId = hasIdAttribute(root);
    const codeGen = new CodeGen({
        root,
        config,
        scopeFragmentId,
    });
    const scope = new Scope();

    const templateFunction = generateTemplateFunction(codeGen, scope);

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
