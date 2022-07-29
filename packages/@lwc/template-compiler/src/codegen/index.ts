/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as astring from 'astring';

import { isBooleanAttribute, SVG_NAMESPACE, LWC_VERSION_COMMENT } from '@lwc/shared';
import { generateCompilerError, TemplateErrors } from '@lwc/errors';

import {
    isComment,
    isText,
    isSlot,
    isStringLiteral,
    isForBlock,
    isIf,
    isForEach,
    isBaseElement,
    isExpression,
    isProperty,
    isComponent,
    isInnerHTMLDirective,
    isDynamicDirective,
    isKeyDirective,
    isDomDirective,
    isElement,
} from '../shared/ast';
import { TEMPLATE_PARAMS, TEMPLATE_FUNCTION_NAME, RENDERER } from '../shared/constants';
import {
    Root,
    ParentNode,
    ChildNode,
    Text,
    If,
    ForBlock,
    ForEach,
    Attribute,
    Property,
    Comment,
    ForOf,
    BaseElement,
} from '../shared/types';
import * as t from '../shared/estree';
import {
    isAllowedFragOnlyUrlsXHTML,
    isAttribute,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';
import State from '../state';
import { isCustomRendererHookRequired } from '../shared/renderer-hooks';
import CodeGen from './codegen';
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

function transform(codeGen: CodeGen): t.Expression {
    function transformElement(element: BaseElement, slotParentName?: string): t.Expression {
        const databag = elementDataBag(element, slotParentName);
        let res: t.Expression;

        if (codeGen.staticNodes.has(element) && isElement(element)) {
            // do not process children of static nodes.
            return codeGen.genHoistedElement(element, slotParentName);
        }

        const children = transformChildren(element);

        // Check wether it has the special directive lwc:dynamic
        const { name } = element;
        const dynamic = element.directives.find(isDynamicDirective);

        if (dynamic) {
            const expression = codeGen.bindExpression(dynamic.value);
            res = codeGen.genDynamicElement(name, expression, databag, children);
        } else if (isComponent(element)) {
            res = codeGen.genCustomElement(
                name,
                identifierFromComponentName(name),
                databag,
                children
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;

            res = codeGen.getSlot(element.slotName, databag, defaultSlot);
        } else {
            res = codeGen.genElement(name, databag, children);
        }

        return res;
    }

    function transformText(consecutiveText: Text[]): t.Expression {
        return codeGen.genText(
            consecutiveText.map(({ value }) => {
                return isStringLiteral(value) ? value.value : codeGen.bindExpression(value);
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

            if (isText(child)) {
                const continuousText: Text[] = [];

                // Consume all the contiguous text nodes.
                do {
                    continuousText.push(child);
                    current = childrenIterator.next();
                    child = current.value;
                } while (!current.done && isText(child));

                res.push(transformText(continuousText));

                // Early exit if a text node is the last child node.
                if (current.done) {
                    break;
                }
            }

            if (isForBlock(child)) {
                res.push(transformForBlock(child));
            } else if (isIf(child)) {
                const children = transformIf(child);
                Array.isArray(children) ? res.push(...children) : res.push(children);
            } else if (isBaseElement(child)) {
                const slotParentName = isSlot(parent) ? parent.slotName : undefined;
                res.push(transformElement(child, slotParentName));
            } else if (isComment(child) && codeGen.preserveComments) {
                res.push(transformComment(child));
            }
        }

        if (shouldFlatten(codeGen, children)) {
            if (children.length === 1 && !containsDynamicChildren(children)) {
                return res[0];
            } else {
                return codeGen.genFlatten([t.arrayExpression(res)]);
            }
        } else {
            return t.arrayExpression(res);
        }
    }

    function transformIf(ifNode: If): t.Expression | t.Expression[] {
        const expression = transformChildren(ifNode);
        let res: t.Expression | t.Expression[];

        if (t.isArrayExpression(expression)) {
            // Bind the expression once for all the template children
            const testExpression = codeGen.bindExpression(ifNode.condition);

            res = t.arrayExpression(
                expression.elements.map((element) =>
                    element !== null
                        ? applyInlineIf(ifNode, element as t.Expression, testExpression)
                        : null
                )
            );
        } else {
            // If the template has a single children, make sure the ternary expression returns an array
            res = applyInlineIf(ifNode, expression, undefined, t.arrayExpression([]));
        }

        if (t.isArrayExpression(res)) {
            // The `if` transformation does not use the SpreadElement, neither null, therefore we can safely
            // typecast it to t.Expression[]
            res = res.elements as t.Expression[];
        }

        return res;
    }

    function applyInlineIf(
        ifNode: If,
        node: t.Expression,
        testExpression?: t.Expression,
        falseValue?: t.Expression
    ): t.Expression {
        if (!testExpression) {
            testExpression = codeGen.bindExpression(ifNode.condition);
        }

        let leftExpression: t.Expression;
        const modifier = ifNode.modifier!;
        if (modifier === 'true') {
            leftExpression = testExpression;
        } else if (modifier === 'false') {
            leftExpression = t.unaryExpression('!', testExpression);
        } else if (modifier === 'strict-true') {
            leftExpression = t.binaryExpression('===', testExpression, t.literal(true));
        } else {
            // This is a defensive check, should be taken care of during parsing.
            throw generateCompilerError(TemplateErrors.UNKNOWN_IF_MODIFIER, {
                messageArgs: [modifier],
            });
        }

        return t.conditionalExpression(leftExpression, node, falseValue ?? t.literal(null));
    }

    function transformForBlock(forBlock: ForBlock): t.Expression {
        let expression = transformForChildren(forBlock);

        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        let res: t.Expression;
        if (isForEach(forBlock)) {
            res = applyInlineFor(forBlock, expression);
        } else {
            res = applyInlineForOf(forBlock, expression);
        }

        return res;
    }

    function transformForChildren(forBlock: ForBlock): t.Expression {
        codeGen.beginScope();

        if (isForEach(forBlock)) {
            const { item, index } = forBlock;
            if (index) {
                codeGen.declareIdentifier(index);
            }

            codeGen.declareIdentifier(item);
        } else {
            codeGen.declareIdentifier(forBlock.iterator);
        }

        const children = transformChildren(forBlock);
        codeGen.endScope();

        return children;
    }

    function applyInlineFor(forEach: ForEach, node: t.Expression): t.Expression {
        const { expression, item, index } = forEach;
        const params = [item];
        if (index) {
            params.push(index);
        }

        const iterable = codeGen.bindExpression(expression);
        const iterationFunction = t.functionExpression(
            null,
            params,
            t.blockStatement([t.returnStatement(node)])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyInlineForOf(forOf: ForOf, node: t.Expression): t.Expression {
        const { expression, iterator } = forOf;
        const { name: iteratorName } = iterator;

        const argsMapping = {
            value: `${iteratorName}Value`,
            index: `${iteratorName}Index`,
            first: `${iteratorName}First`,
            last: `${iteratorName}Last`,
        };

        const iteratorArgs = Object.values(argsMapping).map((arg) => t.identifier(arg));
        const iteratorObject = t.objectExpression(
            Object.entries(argsMapping).map(([prop, arg]) =>
                t.property(t.identifier(prop), t.identifier(arg))
            )
        );

        const iterable = codeGen.bindExpression(expression);
        const iterationFunction = t.functionExpression(
            null,
            iteratorArgs,
            t.blockStatement([
                t.variableDeclaration('const', [
                    t.variableDeclarator(t.identifier(iteratorName), iteratorObject),
                ]),
                t.returnStatement(node),
            ])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function computeAttrValue(
        attr: Attribute | Property,
        element: BaseElement,
        addLegacySanitizationHook: boolean
    ): t.Expression {
        const { name: elmName, namespace = '' } = element;
        const { value: attrValue } = attr;
        // Evaluate properties based on their attribute name
        const attrName = isProperty(attr) ? attr.attributeName : attr.name;
        const isUsedAsAttribute = isAttribute(element, attrName);

        if (isExpression(attrValue)) {
            const expression = codeGen.bindExpression(attrValue);

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
            if (addLegacySanitizationHook && isSvgUseHref(elmName, attrName, namespace)) {
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

            if (addLegacySanitizationHook && isSvgUseHref(elmName, attrName, namespace)) {
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

    function elementDataBag(element: BaseElement, slotParentName?: string): t.ObjectExpression {
        const data: t.Property[] = [];

        const { attributes, properties, listeners } = element;

        const innerHTML = element.directives.find(isInnerHTMLDirective);
        const forKey = element.directives.find(isKeyDirective);
        const dom = element.directives.find(isDomDirective);
        const addSanitizationHook = isCustomRendererHookRequired(element, codeGen.state);

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
                        const classExpression = codeGen.bindExpression(value);
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
                        const styleExpression = codeGen.bindExpression(value);
                        data.push(t.property(t.identifier('style'), styleExpression));
                    } else if (isStringLiteral(value)) {
                        const styleMap = parseStyleText(value.value);
                        const styleAST = styleMapToStyleDeclsAST(styleMap);
                        data.push(t.property(t.identifier('styleDecls'), styleAST));
                    }
                } else {
                    rest[name] = computeAttrValue(attr, element, !addSanitizationHook);
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
        const propsObj = t.objectExpression([]);

        // Properties
        if (properties.length) {
            for (const prop of properties) {
                propsObj.properties.push(
                    t.property(
                        t.literal(prop.name),
                        computeAttrValue(prop, element, !addSanitizationHook)
                    )
                );
            }
        }

        // Properties: lwc:inner-html directive
        if (innerHTML) {
            const expr = isStringLiteral(innerHTML.value)
                ? t.literal(innerHTML.value.value)
                : codeGen.bindExpression(innerHTML.value);
            propsObj.properties.push(
                t.property(
                    t.identifier('innerHTML'),
                    // If lwc:inner-html is added as a directive requiring custom renderer, no need
                    // to add the legacy sanitizeHtmlContent hook
                    addSanitizationHook ? expr : codeGen.genSanitizedHtmlExpr(expr)
                )
            );
        }

        if (propsObj.properties.length) {
            data.push(t.property(t.identifier('props'), propsObj));
        }

        // Context
        if (dom || innerHTML) {
            const contextObj = t.objectExpression([
                t.property(
                    t.identifier('lwc'),
                    t.objectExpression([t.property(t.identifier('dom'), t.literal('manual'))])
                ),
            ]);
            data.push(t.property(t.identifier('context'), contextObj));
        }

        // Key property on VNode
        if (forKey) {
            // If element has user-supplied `key` or is in iterator, call `api.k`
            const forKeyExpression = codeGen.bindExpression(forKey.value);
            const generatedKey = codeGen.genKey(t.literal(codeGen.generateKey()), forKeyExpression);
            data.push(t.property(t.identifier('key'), generatedKey));
        } else {
            // If standalone element with no user-defined key
            let key: number | string = codeGen.generateKey();
            // Parent slot name could be the empty string
            if (slotParentName !== undefined) {
                // Prefixing the key is necessary to avoid conflicts with default content for the
                // slot which might have similar keys. Each vnode will always have a key that starts
                // with a numeric character from compiler. In this case, we add a unique notation
                // for slotted vnodes keys, e.g.: `@foo:1:1`. Note that this is *not* needed for
                // dynamic keys, since `api.k` already scopes based on the iteration.
                key = `@${slotParentName}:${key}`;
            }
            data.push(t.property(t.identifier('key'), t.literal(key)));
        }

        // Event handler
        if (listeners.length) {
            const listenerObj = Object.fromEntries(
                listeners.map((listener) => [listener.name, listener])
            );
            const listenerObjAST = objectToAST(listenerObj, (key) => {
                const componentHandler = codeGen.bindExpression(listenerObj[key].handler);
                const handler = codeGen.genBind(componentHandler);

                return memorizeHandler(codeGen, componentHandler, handler);
            });
            data.push(t.property(t.identifier('on'), listenerObjAST));
        }

        // SVG handling
        if (element.namespace === SVG_NAMESPACE) {
            data.push(t.property(t.identifier('svg'), t.literal(true)));
        }

        if (addSanitizationHook) {
            codeGen.usedLwcApis.add(RENDERER);
            data.push(t.property(t.identifier(RENDERER), t.identifier(RENDERER)));
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

    const usedApis = Object.keys(codeGen.usedApis);
    const body: t.Statement[] =
        usedApis.length === 0
            ? []
            : [
                  t.variableDeclaration('const', [
                      t.variableDeclarator(
                          t.objectPattern(
                              usedApis.map((name) =>
                                  t.assignmentProperty(t.identifier(name), codeGen.usedApis[name])
                              )
                          ),
                          t.identifier(TEMPLATE_PARAMS.API)
                      ),
                  ]),
              ];

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
        t.blockStatement(body, {
            trailingComments: [t.comment(LWC_VERSION_COMMENT)],
        })
    );
}

export default function (root: Root, state: State): string {
    const scopeFragmentId = hasIdAttribute(root);
    const codeGen = new CodeGen({
        root,
        state,
        scopeFragmentId,
    });

    const templateFunction = generateTemplateFunction(codeGen);

    const program: t.Program = formatModule(templateFunction, codeGen);

    return astring.generate(program, { comments: true });
}
