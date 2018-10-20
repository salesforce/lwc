import generate from 'babel-generator';
import * as t from 'babel-types';
import template = require('babel-template');

import State from '../state';
import { ResolvedConfig } from '../config';

import {
    TEMPLATE_PARAMS,
    TEMPLATE_FUNCTION_NAME,
} from '../shared/constants';

import {
    bindExpression,
    rewriteIteratorToArguments,
} from '../shared/scope';

import {
    traverse,
    isCustomElement,
    isComponentProp,
} from '../shared/ir';

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
    getMemberExpressionRoot,
    isTemplate,
    shouldFlatten,
    destructuringAssignmentFromObject,
    isSlot,
} from './helpers';

import CodeGen from './codegen';

import { format as formatModule } from './formatters/module';
import { format as formatFunction } from './formatters/function';
import { isIdReferencingAttribute } from '../parser/attribute';

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
    { sourceType: 'module' },
);

function transform(
    root: IRNode,
    codeGen: CodeGen,
    state: State,
): t.Expression {

    const stack = new Stack<t.Expression>();
    stack.push(
        t.arrayExpression([]),
    );

    const keyForId: Map<string, number> = state.idAttrData
        .reduce((map, data) => {
            map.set(data.value, data.key);
            return map;
        }, new Map());

    traverse(root, {
        text: {
            exit(textNode: IRText) {
                let { value }  = textNode;

                if (typeof value !== 'string') {
                    value = bindExpression(value, textNode).expression as t.MemberExpression;
                }

                (stack.peek() as t.ArrayExpression).elements.push(
                    codeGen.genText(value),
                );
            },
        },

        element: {
            enter() {
                // Create a new frame when visiting a child
                stack.push(
                    t.arrayExpression([]),
                );
            },

            exit(element: IRElement) {
                let children = stack.pop();

                // Apply children flattening
                if (shouldFlatten(element) && t.isArrayExpression(children)) {
                    children = element.children.length === 1 ?
                        children.elements[0] as t.Expression :
                        codeGen.genFlatten([ children ]);
                }

                // Applied the transformation to itself
                isTemplate(element) ?
                    transformTemplate(element, children) :
                    transformElement(element, children);
            },
        }
    });

    /** Transforms IRElement to Javascript AST node and add it at the to of the stack  */
    function transformElement(element: IRElement, children: t.Expression) {
        const databag = elementDataBag(element);

        let babelElement: t.Expression;
        if (isCustomElement(element)) {
            // Make sure to register the component
            const componentClassName = element.component!;

            babelElement = codeGen.genCustomElement(
                element.tag,
                identifierFromComponentName(componentClassName),
                databag,
                children,
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;

            babelElement = codeGen.getSlot(
                element.slotName!,
                databag,
                defaultSlot,
            );
        } else {
            babelElement = codeGen.genElement(
                element.tag,
                databag,
                children,
            );
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
        falseValue: t.Expression = t.nullLiteral(),
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
            throw new Error(`Unknown if modifier ${modifier}`);
        }

        return t.conditionalExpression(
            leftExpression,
            babelNode,
            falseValue,
        );
    }

    function applyInlineFor(
        element: IRElement,
        babelNode: t.Expression,
    ) {
        if (!element.forEach) {
            return babelNode;
        }

        const { expression, item, index } = element.forEach;
        const params  = [item];
        if (index) {
            params.push(index);
        }

        const { expression: iterable } = bindExpression(expression, element);
        const iterationFunction = t.functionExpression(
            undefined,
            params,
            t.blockStatement([t.returnStatement(babelNode)]),
        );

        return codeGen.genIterator(iterable, iterationFunction);
    }

    function applyInlineForOf(
        element: IRElement,
        babelNode: t.Expression,
    ) {
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

        const functionParams = Object.keys(argNames).map((key) => (argNames[key]));
        const iterationFunction = t.functionExpression(
            undefined,
            functionParams,
            t.blockStatement([
                t.returnStatement(babelNode),
            ]),
        );

        const { expression: iterable } = bindExpression(expression, element);
        const { expression: mappedIterationFunction } = rewriteIteratorToArguments(
            iterationFunction,
            iterator,
            argNames,
        );

        return codeGen.genIterator(iterable, mappedIterationFunction);
    }

    function applyTemplateForOf(
        element: IRElement,
        fragmentNodes: t.Expression,
    ) {
        if (!element.forOf) {
            return fragmentNodes;
        }

        let expression = fragmentNodes;
        if (t.isArrayExpression(expression) && expression.elements.length === 1) {
            expression = expression.elements[0] as t.Expression;
        }

        return applyInlineForOf(element, expression);
    }

    function applyTemplateFor(
        element: IRElement,
        fragmentNodes: t.Expression,
    ): t.Expression {
        if (!element.forEach) {
            return fragmentNodes;
        }

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
                fragmentNodes.elements.map((child: t.Expression) => (
                    applyInlineIf(element, child, testExpression)
                )),
            );
        } else {
            // If the template has a single children, make sure the ternary expression returns an array
            return applyInlineIf(element, fragmentNodes, undefined, t.arrayExpression([]));
        }
    }

    function computeAttrValue(attr: IRAttribute, element: IRElement): t.Expression {
        switch (attr.type) {
            case IRAttributeType.Expression:
                let { expression } = bindExpression(attr.value, element);
                if (attr.name === 'tabindex') {
                    expression = codeGen.genTabIndex([expression]);
                }
                return expression;

            case IRAttributeType.String:
                return t.stringLiteral(attr.value);

            case IRAttributeType.Boolean:
                return t.booleanLiteral(attr.value);
        }
    }

    function elementDataBag(
        element: IRElement,
    ): t.ObjectExpression {
        const data: t.ObjectProperty[] = [];
        const {
            classMap,
            className,
            style,
            styleMap,
            attrs,
            props,
            on,
            forKey,
        } = element;

        // Class attibute defined via string
        if (className) {
            const { expression: classExpression } = bindExpression(
                className,
                element,
            );
            data.push(t.objectProperty(t.identifier('className'), classExpression));
        }

        // Class attribute defined via object
        if (classMap) {
            const classMapObj = objectToAST(classMap, () => t.booleanLiteral(true));
            data.push(t.objectProperty(t.identifier('classMap'), classMapObj));
        }

        // Style attribute defined via object
        if (styleMap) {
            const styleObj = objectToAST(
                styleMap,
                key =>
                    typeof styleMap[key] === 'number'
                        ? t.numericLiteral(styleMap[key] as number)
                        : t.stringLiteral(styleMap[key] as string),
            );

            data.push(t.objectProperty(t.identifier('styleMap'), styleObj));
        }

        // Style attribute defined via string
        if (style) {
            const { expression: styleExpression } = bindExpression(style, element);
            data.push(t.objectProperty(t.identifier('style'), styleExpression));
        }

        function generateScopedIdFunctionForIdAttr(id: string): t.CallExpression {
            const key = keyForId.get(id);
            if (forKey) {
                const generatedKey = codeGen.genKey(
                    t.numericLiteral(key),
                    bindExpression(forKey, element).expression
                );
                return codeGen.genScopedId(id, generatedKey);
            } else {
                return codeGen.genScopedId(id, t.numericLiteral(key));
            }
        }

        function generateScopedIdFunctionForIdRefAttr(idRef: string): t.CallExpression | t.TemplateLiteral {
            const expressions = idRef
                .split(/\s+/) // handle space-delimited idrefs (e.g., aria-labelledby="foo bar")
                .map(generateScopedIdFunctionForIdAttr);

            if (expressions.length === 1) {
                return expressions[0];
            } else {
                // Combine each computed scoped id via template literal (e.g., `${api_scoped_id()} ${api_scoped_id()}`)
                const spacesBetweenIdRefs = ' '.repeat(expressions.length - 1).split('');
                const quasis = ['', ...spacesBetweenIdRefs, '']
                    .map(str => t.templateElement({ raw: str }));
                return t.templateLiteral(quasis, expressions);
            }
        }

        // Attributes
        if (attrs) {
            const attrsObj = objectToAST(attrs, key => {
                const value = attrs[key].value;
                if (typeof value === 'string') {
                    if (key === 'id') {
                        return generateScopedIdFunctionForIdAttr(value);
                    }
                    if (isIdReferencingAttribute(key)) {
                        return generateScopedIdFunctionForIdRefAttr(value);
                    }
                }
                return computeAttrValue(attrs[key], element);
            });
            data.push(t.objectProperty(t.identifier('attrs'), attrsObj));
        }

        // Properties
        if (props) {
            const propsObj = objectToAST(props, key => {
                const { name: attrName, value } = props[key];
                if (typeof value === 'string') {
                    if (attrName === 'id') {
                        return generateScopedIdFunctionForIdAttr(value);
                    }
                    if (isIdReferencingAttribute(attrName)) {
                        return generateScopedIdFunctionForIdRefAttr(value);
                    }
                }
                return computeAttrValue(props[key], element);
            });
            data.push(t.objectProperty(t.identifier('props'), propsObj));
        }

        // Key property on VNode
        if (forKey) {
            // If element has user-supplied `key` or is in iterator, call `api.k`
            const { expression: forKeyExpression } = bindExpression(forKey, element);
            const generatedKey = codeGen.genKey(t.numericLiteral(element.key!), forKeyExpression);
            data.push(t.objectProperty(t.identifier('key'), generatedKey));
        } else {
            // If stand alone element with no user-defined key
            // member expression id
            data.push(t.objectProperty(t.identifier('key'), t.numericLiteral(element.key!)));
        }

        // Event handler
        if (on) {
            const onObj = objectToAST(on, key => {
                const { expression: componentHandler } = bindExpression(on[key], element);
                let handler: t.Expression = codeGen.genBind(componentHandler);

                // #439 - The handler can only be memorized if it is bound to component instance
                const id = getMemberExpressionRoot(componentHandler as t.MemberExpression);
                const shouldMemorizeHandler = isComponentProp(id, element);

                // Apply memorization if the handler is memorizable.
                //   $cmp.handlePress -> _m1 || ($ctx._m1 = b($cmp.handlePress))
                if (shouldMemorizeHandler) {
                    const memorizedId = codeGen.getMemorizationId();
                    const memorization = t.assignmentExpression(
                        '=',
                        t.memberExpression(
                            t.identifier(TEMPLATE_PARAMS.CONTEXT),
                            memorizedId,
                        ),
                        handler,
                    );

                    handler = t.logicalExpression(
                        '||',
                        memorizedId,
                        memorization,
                    );
                }

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
    const statement = transform(templateRoot, codeGen, state);

    const apis = destructuringAssignmentFromObject(
        t.identifier(TEMPLATE_PARAMS.API),
        Object.keys(codeGen.usedApis).map(name => (
            t.objectProperty(
                t.identifier(name),
                codeGen.usedApis[name],
                false,
                true,
            )
        )),
    );

    let slots: t.Node = t.noop();
    if (Object.keys(codeGen.usedSlots).length) {
        slots = destructuringAssignmentFromObject(
            t.identifier(TEMPLATE_PARAMS.SLOT_SET),
            Object.keys(codeGen.usedSlots).map(name => (
                t.objectProperty(
                    t.stringLiteral(name),
                    codeGen.usedSlots[name],
                    false,
                    true,
                )
            )),
        );
    }

    let context: t.Node = t.noop();
    if (codeGen.memorizedIds.length) {
        context = destructuringAssignmentFromObject(
            t.identifier(TEMPLATE_PARAMS.CONTEXT),
            codeGen.memorizedIds.map(id => (
                t.objectProperty(
                    id,
                    id,
                    false,
                    true,
                )
            )),
        );
    }

    return TEMPLATE_FUNCTION({
        APIS: apis,
        SLOTS: slots,
        CONTEXT: context,
        STATEMENT:  statement,
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

export default function(templateRoot: IRElement, state: State, options: ResolvedConfig): CompilationOutput {
    const templateFunction = generateTemplateFunction(templateRoot, state);
    const formatter = format(state);
    const program = formatter(templateFunction, state, options);

    const { code } = generate(program);
    return {
        ast: program,
        code,
    };
}
