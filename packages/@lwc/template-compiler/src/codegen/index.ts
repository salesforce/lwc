/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import generate from '@babel/generator';
import * as t from '@babel/types';
import template from '@babel/template';
import * as parse5 from 'parse5-with-errors';
import { isBooleanAttribute, isGlobalHtmlAttribute } from '@lwc/shared';

import State from '../state';

import { TEMPLATE_PARAMS, TEMPLATE_FUNCTION_NAME } from '../shared/constants';

import { bindExpression, rewriteIteratorToArguments } from '../shared/scope';

import { traverse, isCustomElement } from '../shared/ir';

import {
    IRNode,
    IRElement,
    IRText,
    IRAttribute,
    IRAttributeType,
    CompilationOutput,
} from '../shared/types';

import Stack from '../shared/stack';

import {
    identifierFromComponentName,
    objectToAST,
    isTemplate,
    isStyleSheet,
    shouldFlatten,
    destructuringAssignmentFromObject,
    isSlot,
    memorizeHandler,
    containsDynamicChildren,
} from './helpers';

import CodeGen from './codegen';

import { format as formatModule } from './formatters/module';
import { format as formatFunction } from './formatters/function';
import {
    isAllowedFragOnlyUrlsXHTML,
    isAttribute,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';

import { TemplateErrors, generateCompilerError } from '@lwc/errors';

const TEMPLATE_FUNCTION = template(
    `function ${TEMPLATE_FUNCTION_NAME}(
        ${TEMPLATE_PARAMS.API},
        ${TEMPLATE_PARAMS.INSTANCE},
        ${TEMPLATE_PARAMS.SLOT_SET},
        ${TEMPLATE_PARAMS.CONTEXT}
    ) {
        APIS;
        SLOTS;
        CONTEXT;
        return STATEMENT;
    }`,
    { sourceType: 'module' }
);

const DISALLOWED_LWC_DIRECTIVES = new Set(['dynamic']);

function generateContext(element: IRElement, data: t.ObjectProperty[]) {
    const { lwc } = element;
    const contextExpressions: t.ObjectProperty[] = [];

    // LWC
    if (lwc) {
        const lwcObject: t.ObjectProperty[] = Object.keys(lwc)
            .filter((key) => !DISALLOWED_LWC_DIRECTIVES.has(key))
            .map((key) => {
                return t.objectProperty(t.identifier(key), t.stringLiteral((lwc as any)[key]));
            });

        const lwcObj = t.objectProperty(t.identifier('lwc'), t.objectExpression(lwcObject));
        contextExpressions.push(lwcObj);
    }

    data.push(t.objectProperty(t.identifier('context'), t.objectExpression(contextExpressions)));
}

function initialPassToCheckForIds(root: IRNode) {
    let templateContainsId = false;
    traverse(root, {
        element: {
            exit(element: IRElement) {
                const { attrs, props } = element;
                if (attrs && attrs.id) {
                    templateContainsId = true;
                }
                if (props && props.id) {
                    templateContainsId = true;
                }
            },
        },
    });
    return templateContainsId;
}

function transform(root: IRNode, codeGen: CodeGen): t.Expression {
    const stack = new Stack<t.Expression>();
    stack.push(t.arrayExpression([]));

    // Initial scan to detect any id attributes in order to avoid manging href
    // values in this case. This is only temporary:
    // https://github.com/salesforce/lwc/issues/1150
    const templateContainsId = initialPassToCheckForIds(root);

    traverse(root, {
        text: {
            exit(textNode: IRText) {
                let { value } = textNode;

                if (typeof value !== 'string') {
                    value = bindExpression(value, textNode).expression as t.MemberExpression;
                }

                (stack.peek() as t.ArrayExpression).elements.push(codeGen.genText(value));
            },
        },

        element: {
            enter() {
                // Create a new frame when visiting a child
                stack.push(t.arrayExpression([]));
            },

            exit(element: IRElement) {
                if (isStyleSheet(element)) {
                    codeGen.genInlineStyles(element.inlineStyles);
                    return;
                }

                let children = stack.pop();

                // Apply children flattening
                if (shouldFlatten(element) && t.isArrayExpression(children)) {
                    children =
                        element.children.length === 1 && !containsDynamicChildren(element) // if it contains only one dynamic we need to flatten anyway
                            ? (children.elements[0] as t.Expression)
                            : codeGen.genFlatten([children]);
                }

                // Applied the transformation to itself
                isTemplate(element)
                    ? transformTemplate(element, children)
                    : transformElement(element, children, templateContainsId);
            },
        },
    });

    /** Transforms IRElement to Javascript AST node and add it at the to of the stack  */
    function transformElement(
        element: IRElement,
        children: t.Expression,
        templateContainsId: boolean
    ) {
        const databag = elementDataBag(element, templateContainsId);
        let babelElement: t.Expression;

        // Check wether it has the special directive lwc:dynamic
        if (element.lwc && element.lwc.dynamic) {
            const { expression } = bindExpression(element.lwc.dynamic, element);
            babelElement = codeGen.genDynamicElement(element.tag, expression, databag, children);
        } else if (isCustomElement(element)) {
            // Make sure to register the component
            const componentClassName = element.component!;

            babelElement = codeGen.genCustomElement(
                element.tag,
                identifierFromComponentName(componentClassName),
                databag,
                children
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;

            babelElement = codeGen.getSlot(element.slotName!, databag, defaultSlot);
        } else {
            babelElement = codeGen.genElement(element.tag, databag, children);
        }

        babelElement = applyInlineIf(element, babelElement);
        babelElement = applyInlineFor(element, babelElement);

        (stack.peek() as t.ArrayExpression).elements.push(babelElement);
    }

    /** Transform template IRElement and add it at the top of the stack */
    function transformTemplate(element: IRElement, children: t.Expression) {
        let expression = applyTemplateIf(element, children);

        if (element.forEach) {
            expression = applyTemplateFor(element, expression);
            (stack.peek() as t.ArrayExpression).elements.push(expression);
        } else if (element.forOf) {
            expression = applyTemplateForOf(element, expression);
            (stack.peek() as t.ArrayExpression).elements.push(expression);
        } else if (t.isArrayExpression(expression) && element.if) {
            // Inject inlined if elements directly
            return (stack.peek() as t.ArrayExpression).elements.push(...expression.elements);
        } else {
            (stack.peek() as t.ArrayExpression).elements.push(expression);
        }
    }

    function applyInlineIf(
        element: IRElement,
        babelNode: t.Expression,
        testExpression?: t.Expression,
        falseValue: t.Expression = t.nullLiteral()
    ): t.Expression {
        if (!element.if) {
            return babelNode;
        }

        if (!testExpression) {
            testExpression = bindExpression(element.if!, element).expression;
        }

        let leftExpression: t.Expression;
        const modifier = element.ifModifier!;
        if (modifier === 'true') {
            leftExpression = testExpression;
        } else if (modifier === 'false') {
            leftExpression = t.unaryExpression('!', testExpression);
        } else if (modifier === 'strict-true') {
            leftExpression = t.binaryExpression('===', testExpression, t.booleanLiteral(true));
        } else {
            throw generateCompilerError(TemplateErrors.UNKNOWN_IF_MODIFIER, {
                messageArgs: [modifier],
            });
        }

        return t.conditionalExpression(leftExpression, babelNode, falseValue);
    }

    function applyInlineFor(element: IRElement, babelNode: t.Expression) {
        if (!element.forEach) {
            return babelNode;
        }

        const { expression, item, index } = element.forEach;
        const params = [item];
        if (index) {
            params.push(index);
        }

        const { expression: iterable } = bindExpression(expression, element);
        const iterationFunction = t.functionExpression(
            undefined,
            params,
            t.blockStatement([t.returnStatement(babelNode)])
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyInlineForOf(element: IRElement, babelNode: t.Expression) {
        if (!element.forOf) {
            return babelNode;
        }

        const { expression, iterator } = element.forOf;
        const { name: iteratorName } = iterator;

        const argNames: { [key: string]: t.Identifier } = {
            value: t.identifier(`${iteratorName}Value`),
            index: t.identifier(`${iteratorName}Index`),
            first: t.identifier(`${iteratorName}First`),
            last: t.identifier(`${iteratorName}Last`),
        };

        const functionParams = Object.keys(argNames).map((key) => argNames[key]);
        const iterationFunction = t.functionExpression(
            undefined,
            functionParams,
            t.blockStatement([t.returnStatement(babelNode)])
        );

        const { expression: iterable } = bindExpression(expression, element);
        const { expression: mappedIterationFunction } = rewriteIteratorToArguments(
            iterationFunction,
            iterator,
            argNames
        );

        return codeGen.genIterator(iterable, mappedIterationFunction);
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
            const { expression: testExpression } = bindExpression(element.if!, element);

            return t.arrayExpression(
                fragmentNodes.elements.map((child) =>
                    child !== null ? applyInlineIf(element, child as any, testExpression) : null
                )
            );
        } else {
            // If the template has a single children, make sure the ternary expression returns an array
            return applyInlineIf(element, fragmentNodes, undefined, t.arrayExpression([]));
        }
    }

    function generateScopedIdFunctionForIdRefAttr(
        idRef: string
    ): t.CallExpression | t.TemplateLiteral {
        const expressions: t.CallExpression[] = idRef
            .split(/\s+/) // handle space-delimited idrefs (e.g., aria-labelledby="foo bar")
            .map(codeGen.genScopedId.bind(codeGen));

        // Embed call expressions into a template literal:
        // [api_scoped_id()] => `${api_scoped_id()}`
        // [api_scoped_id(), api_scoped_id()] => `${api_scoped_id()} ${api_scoped_id()}`
        const spacesBetweenIdRefs = ' '.repeat(expressions.length - 1).split('');
        const quasis = ['', ...spacesBetweenIdRefs, ''].map((str) =>
            t.templateElement({ raw: str })
        );
        return t.templateLiteral(quasis, expressions);
    }

    function computeAttrValue(
        attr: IRAttribute,
        element: IRElement,
        templateContainsId: boolean
    ): t.Expression {
        const { namespaceURI, tagName } = element.__original as parse5.AST.Default.Element;
        const isUsedAsAttribute = isAttribute(element, attr.name);

        switch (attr.type) {
            case IRAttributeType.Expression: {
                const { expression } = bindExpression(attr.value, element);
                if (isUsedAsAttribute && isBooleanAttribute(attr.name)) {
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
                    templateContainsId &&
                    isAllowedFragOnlyUrlsXHTML(tagName, attr.name, namespaceURI)
                ) {
                    return codeGen.genScopedFragId(expression);
                }
                if (isSvgUseHref(tagName, attr.name, namespaceURI)) {
                    return t.callExpression(t.identifier('sanitizeAttribute'), [
                        t.stringLiteral(tagName),
                        t.stringLiteral(namespaceURI),
                        t.stringLiteral(attr.name),
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
                    return t.booleanLiteral(attr.value.toLowerCase() !== 'false');
                }

                // @todo[1957]: improve isBooleanAttribute implementation
                if (
                    !isUsedAsAttribute &&
                    isBooleanAttribute(attr.name) &&
                    isGlobalHtmlAttribute(attr.name)
                ) {
                    // We are in presence of a string value, for a recognized boolean attribute, which is used as
                    // property. for these cases, always set the property to true.
                    return t.booleanLiteral(true);
                }

                if (isIdReferencingAttribute(attr.name)) {
                    return generateScopedIdFunctionForIdRefAttr(attr.value);
                }
                if (
                    templateContainsId &&
                    isAllowedFragOnlyUrlsXHTML(tagName, attr.name, namespaceURI) &&
                    isFragmentOnlyUrl(attr.value)
                ) {
                    return codeGen.genScopedFragId(attr.value);
                }
                if (isSvgUseHref(tagName, attr.name, namespaceURI)) {
                    return t.callExpression(t.identifier('sanitizeAttribute'), [
                        t.stringLiteral(tagName),
                        t.stringLiteral(namespaceURI),
                        t.stringLiteral(attr.name),
                        isFragmentOnlyUrl(attr.value)
                            ? codeGen.genScopedFragId(attr.value)
                            : t.stringLiteral(attr.value),
                    ]);
                }
                return t.stringLiteral(attr.value);
            }

            case IRAttributeType.Boolean: {
                // A boolean value used in an attribute should always generate .setAttribute(attr.name, ''),
                // regardless if is a boolean attribute or not.
                return isUsedAsAttribute ? t.stringLiteral('') : t.booleanLiteral(attr.value);
            }
        }
    }

    function elementDataBag(element: IRElement, templateContainsId: boolean): t.ObjectExpression {
        const data: t.ObjectProperty[] = [];
        const { classMap, className, style, styleMap, attrs, props, on, forKey, lwc } = element;

        // Class attibute defined via string
        if (className) {
            const { expression: classExpression } = bindExpression(className, element);
            data.push(t.objectProperty(t.identifier('className'), classExpression));
        }

        // Class attribute defined via object
        if (classMap) {
            const classMapObj = objectToAST(classMap, () => t.booleanLiteral(true));
            data.push(t.objectProperty(t.identifier('classMap'), classMapObj));
        }

        // Style attribute defined via object
        if (styleMap) {
            const styleObj = objectToAST(styleMap, (key) =>
                typeof styleMap[key] === 'number'
                    ? t.numericLiteral(styleMap[key] as number)
                    : t.stringLiteral(styleMap[key] as string)
            );

            data.push(t.objectProperty(t.identifier('styleMap'), styleObj));
        }

        // Style attribute defined via string
        if (style) {
            const { expression: styleExpression } = bindExpression(style, element);
            data.push(t.objectProperty(t.identifier('style'), styleExpression));
        }

        // Attributes
        if (attrs) {
            const attrsObj = objectToAST(attrs, (key) => {
                return computeAttrValue(attrs[key], element, templateContainsId);
            });
            data.push(t.objectProperty(t.identifier('attrs'), attrsObj));
        }

        // Properties
        if (props) {
            const propsObj = objectToAST(props, (key) => {
                return computeAttrValue(props[key], element, templateContainsId);
            });
            data.push(t.objectProperty(t.identifier('props'), propsObj));
        }

        if (lwc) {
            generateContext(element, data);
        }

        // Key property on VNode
        if (forKey) {
            // If element has user-supplied `key` or is in iterator, call `api.k`
            const { expression: forKeyExpression } = bindExpression(forKey, element);
            const generatedKey = codeGen.genKey(
                t.numericLiteral(codeGen.generateKey()),
                forKeyExpression
            );
            data.push(t.objectProperty(t.identifier('key'), generatedKey));
        } else {
            // If stand alone element with no user-defined key
            // member expression id
            data.push(
                t.objectProperty(t.identifier('key'), t.numericLiteral(codeGen.generateKey()))
            );
        }

        // Event handler
        if (on) {
            const onObj = objectToAST(on, (key) => {
                const { expression: componentHandler } = bindExpression(on[key], element);
                let handler: t.Expression = codeGen.genBind(componentHandler);

                handler = memorizeHandler(codeGen, element, componentHandler, handler);

                return handler;
            });
            data.push(t.objectProperty(t.identifier('on'), onObj));
        }

        return t.objectExpression(data);
    }

    return (stack.peek() as t.ArrayExpression).elements[0] as t.Expression;
}

function generateTemplateFunction(templateRoot: IRElement, state: State): t.FunctionDeclaration {
    const codeGen = new CodeGen();
    const statement = transform(templateRoot, codeGen);

    // Copy AST generated styles to the state
    state.inlineStyle.body = codeGen.inlineStyleBody;
    state.inlineStyle.imports = codeGen.inlineStyleImports;

    const apis = destructuringAssignmentFromObject(
        t.identifier(TEMPLATE_PARAMS.API),
        Object.keys(codeGen.usedApis).map((name) =>
            t.objectProperty(t.identifier(name), codeGen.usedApis[name], false, true)
        )
    );

    let slots: t.Node | null = null;
    if (Object.keys(codeGen.usedSlots).length) {
        slots = destructuringAssignmentFromObject(
            t.identifier(TEMPLATE_PARAMS.SLOT_SET),
            Object.keys(codeGen.usedSlots).map((name) =>
                t.objectProperty(t.stringLiteral(name), codeGen.usedSlots[name], false, true)
            )
        );
    }

    let context: t.Node | null = null;
    if (codeGen.memorizedIds.length) {
        context = destructuringAssignmentFromObject(
            t.identifier(TEMPLATE_PARAMS.CONTEXT),
            codeGen.memorizedIds.map((id) => t.objectProperty(id, id, false, true))
        );
    }

    return TEMPLATE_FUNCTION({
        APIS: apis,
        SLOTS: slots,
        CONTEXT: context,
        STATEMENT: statement,
    }) as t.FunctionDeclaration;
}

function format({ config }: State) {
    switch (config.format) {
        case 'function':
            return formatFunction;

        default:
            return formatModule;
    }
}

export default function (templateRoot: IRElement, state: State): CompilationOutput {
    const templateFunction = generateTemplateFunction(templateRoot, state);
    const formatter = format(state);
    const program = formatter(templateFunction, state);

    const { code } = generate(program);
    return {
        ast: program,
        code,
    };
}
