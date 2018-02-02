import generate from 'babel-generator';
import * as t from 'babel-types';

import template = require('babel-template');

import State from '../state';

import {
    TEMPLATE_PARAMS,
    TEMPLATE_FUNCTION_NAME,
} from '../shared/constants';

import {
    bindExpression,
    rewriteIteratorToArguments,
} from '../shared/scope';

import {
    createElement as createIRElement,
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
    importFromComponentName,
    objectToAST,
    getMemberExpressionRoot,
    isTemplate,
    isSlot,
    shouldFlatten,
    destructuringAssignmentFromObject,
    getKeyGenerator,
} from './helpers';

import CodeGen from './codegen';

function transform(
    root: IRNode,
    codeGen: CodeGen,
    state: State,
    generateKey: () => number = getKeyGenerator(),
): t.Expression {

    const stack = new Stack<t.Expression>();
    stack.push(
        t.arrayExpression([]),
    );

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

                // Apply children flatening
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
        },
    });

    /** Transforms IRElement to Javascript AST node and add it at the to of the stack  */
    function transformElement(element: IRElement, children: t.Expression) {
        const databag = elementDataBag(element);

        let babelElement: t.Expression;
        if (isCustomElement(element)) {
            // Traverse custom components slots and it to the databag
            transformSlotset(element, databag);

            // Make sure to register the component
            const componentClassName = element.component!;

            babelElement = codeGen.genCustomElement(
                element.tag,
                identifierFromComponentName(componentClassName),
                databag,
            );
        } else if (isSlot(element)) {
            const defaultSlot = children;
            const passedSlot = codeGen.getSlotId(element.slotName!);

            babelElement = t.logicalExpression(
                '||',
                passedSlot,
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

    function transformSlotset(element: IRElement, databag: t.ObjectExpression) {
        if (!element.slotSet) {
            return;
        }

        const slots: t.ObjectProperty[] = [];
        Object.keys(element.slotSet).forEach((key) => {

            const slotRoot = createIRElement('template', {});
            slotRoot.children = element.slotSet![key];
            slots.push(
                t.objectProperty(
                    t.stringLiteral(key),
                    transform(slotRoot, codeGen, state, generateKey),
                ),
            );
        });

        databag.properties.push(
            t.objectProperty(t.stringLiteral('slotset'), t.objectExpression(slots)),
        );
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
                const { expression } = bindExpression(attr.value, element);
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

        // Class attibute defined via an object
        if (classMap) {
            const classMapObj = objectToAST(classMap, () => t.booleanLiteral(true));
            data.push(t.objectProperty(t.identifier('classMap'), classMapObj));
        }

        // Style attibute defined via an object
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

        // Style attibute defined via a string
        if (style) {
            const { expression: styleExpression } = bindExpression(style, element);
            data.push(t.objectProperty(t.identifier('style'), styleExpression));
        }

        // Attributes
        if (attrs) {
            const attrsObj = objectToAST(attrs, key =>
                computeAttrValue(attrs[key], element),
            );
            data.push(t.objectProperty(t.identifier('attrs'), attrsObj));
        }

        // Properties
        if (props) {
            const propsObj = objectToAST(props, key =>
                computeAttrValue(props[key], element),
            );
            data.push(t.objectProperty(t.identifier('props'), propsObj));
        }

        // Key property on VNode
        const compilerKey = t.numericLiteral(generateKey());
        if (forKey) {
            const { expression: forKeyExpression } = bindExpression(forKey, element);
            data.push(
                t.objectProperty(
                    t.identifier('key'),
                    codeGen.genKey(compilerKey, forKeyExpression)
                )
            );
        } else {
            data.push(t.objectProperty(t.identifier('key'), compilerKey));
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

/**
 * Generate metadata that will be attached to the template function
 */
function generateTemplateMetadata(state: State): t.ExpressionStatement[] {
    const metadataExpressions: t.ExpressionStatement[] = [];

    // Generate the slots property on template function if slots are defined in the template
    // tmpl.slots = ['$default$', 'x']
    if (state.slots.length) {
        const slotsProperty = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier('slots'),
        );

        const slotsArray = t.arrayExpression(
            state.slots.map((slot) => t.stringLiteral(slot)),
        );

        const slotsMetadata = t.assignmentExpression('=', slotsProperty, slotsArray);
        metadataExpressions.push(
            t.expressionStatement(slotsMetadata),
        );
    }

    return metadataExpressions;
}

const TEMPLATE_FUNCTION = template(
    `export default function ${TEMPLATE_FUNCTION_NAME}(
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

export default function(templateRoot: IRElement, state: State): CompilationOutput {
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

    const content = TEMPLATE_FUNCTION({
        APIS: apis,
        SLOTS: slots,
        CONTEXT: context,
        STATEMENT:  statement,
    }) as t.ExportDefaultDeclaration;

    const intro = state.dependencies.map((cmpClassName) => (
        importFromComponentName(cmpClassName)
    ));

    const outro = generateTemplateMetadata(state);

    const program = t.program([
        ...intro,
        content,
        ...outro,
    ]);

    const { code } = generate(program);
    return {
        ast: program,
        code,
    };
}
