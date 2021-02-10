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

import { isBooleanAttribute } from '@lwc/shared';
import { TemplateErrors, generateCompilerError } from '@lwc/errors';

import State from '../state';

import { isCustomElement, isElement } from '../shared/ir';
import { TEMPLATE_PARAMS, TEMPLATE_FUNCTION_NAME } from '../shared/constants';
import {
    IRNode,
    IRElement,
    IRText,
    IRAttribute,
    IRAttributeType,
    CompilationOutput,
} from '../shared/types';

import CodeGen from './codegen';
import { bindExpression } from './scope';
import {
    identifierFromComponentName,
    objectToAST,
    isTemplate,
    shouldFlatten,
    destructuringAssignmentFromObject,
    isSlot,
    memorizeHandler,
    containsDynamicChildren,
} from './helpers';

import { format as formatModule } from './formatters/module';
import { format as formatFunction } from './formatters/function';

import {
    isAllowedFragOnlyUrlsXHTML,
    isAttribute,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';

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


function transform(root: IRElement, codeGen: CodeGen, state: State): t.Expression {
    function transformElement(element: IRElement): t.Expression {
        const databag = elementDataBag(element);
        let res: t.Expression;

        const children = transformChildren(element.children);

        // Check wether it has the special directive lwc:dynamic
        if (element.lwc && element.lwc.dynamic) {
            const expression = bindExpression(element.lwc.dynamic, element);
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

    function transformTemplate(
        element: IRElement
    ): t.Expression | Array<null | t.Expression | t.SpreadElement> {
        const children = transformChildren(element.children);

        let res = applyTemplateIf(element, children);

        if (element.forEach) {
            res = applyTemplateFor(element, res);
        } else if (element.forOf) {
            res = applyTemplateForOf(element, res);
        }

        if (t.isArrayExpression(res) && element.if) {
            return res.elements;
        } else {
            return res;
        }
    }

    function transformText(text: IRText): t.Expression {
        const { value } = text;
        return codeGen.genText(
            typeof value === 'string' ? value : bindExpression(value, text)
        );
    }

    function transformChildren(children: IRNode[]): t.Expression {
        const res = children.reduce<t.Expression[]>((acc, child) => {
            let expr;

            if (isElement(child)) {
                expr = isTemplate(child) ? transformTemplate(child) : transformElement(child);
            } else {
                expr = transformText(child);
            }

            return acc.concat(expr as t.Expression[]);
        }, []);

        if (shouldFlatten(children)) {
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
        babelNode: t.Expression,
        testExpression?: t.Expression,
        falseValue: t.Expression = t.nullLiteral()
    ): t.Expression {
        if (!element.if) {
            return babelNode;
        }

        if (!testExpression) {
            testExpression = bindExpression(element.if!, element);
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

        const iterable = bindExpression(expression, element);
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

        const argsMapping = {
            value: `${iteratorName}Value`,
            index: `${iteratorName}Index`,
            first: `${iteratorName}First`,
            last: `${iteratorName}Last`,
        };

        const iteratorArgs = Object.values(argsMapping).map((arg) => t.identifier(arg));
        const iteratorObjet = t.objectExpression(
            Object.entries(argsMapping).map(([prop, arg]) =>
                t.objectProperty(t.identifier(prop), t.identifier(arg))
            )
        );

        const iterable = bindExpression(expression, element);
        const iterationFunction = t.functionExpression(
            undefined,
            iteratorArgs,
            t.blockStatement([
                t.variableDeclaration('const', [
                    t.variableDeclarator(t.identifier(iteratorName), iteratorObjet),
                ]),
                t.returnStatement(babelNode),
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
            const testExpression = bindExpression(element.if!, element);

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

    function computeAttrValue(attr: IRAttribute, element: IRElement): t.Expression {
        const { namespaceURI, tagName } = element.__original as parse5.AST.Default.Element;
        const isUsedAsAttribute = isAttribute(element, attr.name);

        switch (attr.type) {
            case IRAttributeType.Expression: {
                const expression = bindExpression(attr.value, element);

                // TODO [#2012]: Normalize global boolean attrs values passed to custom elements as props
                if (isUsedAsAttribute && isBooleanAttribute(attr.name, tagName)) {
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
                    state.shouldScopeFragmentId &&
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

                if (!isUsedAsAttribute && isBooleanAttribute(attr.name, tagName)) {
                    // We are in presence of a string value, for a recognized boolean attribute, which is used as
                    // property. for these cases, always set the property to true.
                    return t.booleanLiteral(true);
                }

                if (isIdReferencingAttribute(attr.name)) {
                    return generateScopedIdFunctionForIdRefAttr(attr.value);
                }
                if (
                    state.shouldScopeFragmentId &&
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

    function elementDataBag(element: IRElement): t.ObjectExpression {
        const data: t.ObjectProperty[] = [];
        const { classMap, className, style, styleMap, attrs, props, on, forKey, lwc } = element;

        // Class attibute defined via string
        if (className) {
            const classExpression = bindExpression(className, element);
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
            const styleExpression = bindExpression(style, element);
            data.push(t.objectProperty(t.identifier('style'), styleExpression));
        }

        // Attributes
        if (attrs) {
            const attrsObj = objectToAST(attrs, (key) => {
                return computeAttrValue(attrs[key], element);
            });
            data.push(t.objectProperty(t.identifier('attrs'), attrsObj));
        }

        // Properties
        if (props) {
            const propsObj = objectToAST(props, (key) => {
                return computeAttrValue(props[key], element);
            });
            data.push(t.objectProperty(t.identifier('props'), propsObj));
        }

        if (lwc) {
            generateContext(element, data);
        }

        // Key property on VNode
        if (forKey) {
            // If element has user-supplied `key` or is in iterator, call `api.k`
            const forKeyExpression = bindExpression(forKey, element);
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
                const componentHandler = bindExpression(on[key], element);
                let handler: t.Expression = codeGen.genBind(componentHandler);

                handler = memorizeHandler(codeGen, element, componentHandler, handler);

                return handler;
            });
            data.push(t.objectProperty(t.identifier('on'), onObj));
        }

        return t.objectExpression(data);
    }

    return transformChildren(root.children);
}

function generateTemplateFunction(templateRoot: IRElement, state: State): t.FunctionDeclaration {
    const codeGen = new CodeGen();
    const statement = transform(templateRoot, codeGen, state);

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
