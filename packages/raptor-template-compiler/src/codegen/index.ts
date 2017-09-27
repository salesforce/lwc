import generate from 'babel-generator';
import * as t from 'babel-types';

import template = require('babel-template');

import {
    TEMPLATE_PARAMS,
    TEMPLATE_FUNCTION_NAME,
    DEFAULT_SLOT_NAME,
} from '../shared/constants';

import {
    bindExpression,
    rewriteIteratorToArguments,
} from '../shared/scope';

import {
    RENDER_PRIMITIVE_API,
    createText,
    createElement,
    createCustomElement,
    identifierFromComponentName,
    importFromComponentName,
    objectToAST,
    getMemberExpressionRoot,
} from './helpers';

import {
    createElement as createIRElement,
    traverse,
    isElement,
    isCustomElement,
    isComponentProp,
} from '../shared/ir';

import {
    IRNode,
    IRElement,
    IRText,
    IRAttribute,
    IRAttributeType,
    CompilationMetadata,
    CompilationOutput,
} from '../shared/types';

import * as memorization from './memorization';

import Stack from '../shared/stack';

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

function applyInlineFor(element: IRElement, babelNode: t.Expression) {
    if (!element.forEach) {
        return babelNode;
    }

    const { expression, item, index } = element.forEach;
    const params  = [item];
    if (index) {
        params.push(index);
    }

    const iterationFunction = t.functionExpression(
        undefined,
        params,
        t.blockStatement([t.returnStatement(babelNode)]),
    );

    const { expression: iterable } = bindExpression(expression, element);

    return t.callExpression(
        RENDER_PRIMITIVE_API.ITERATOR,
        [ iterable, iterationFunction ],
    );
}

function applyInlineForOf(element: IRElement, babelNode: t.Expression): t.Expression {
    if (!element.forOf) {
        return babelNode;
    }

    const stack = new Stack<t.Expression >();
    stack.push(
        t.arrayExpression([]),
    );

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

    const { expression: mappedIterationFunction } = rewriteIteratorToArguments(iterationFunction, iterator, argNames);

    const { expression: iterable } = bindExpression(expression, element);

    return t.callExpression(
        RENDER_PRIMITIVE_API.ITERATOR,
        [ iterable, mappedIterationFunction ],
    );
}

function applyTemplateForOf(element: IRElement, fragmentNodes: t.Expression): t.Expression {
    if (!element.forOf) {
        return fragmentNodes;
    }

    let expression = fragmentNodes;
    if (t.isArrayExpression(expression) && expression.elements.length === 1) {
        expression = expression.elements[0] as t.Expression;
    }

    return applyInlineForOf(element, expression);
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

function applyTemplateFor(element: IRElement, fragmentNodes: t.Expression): t.Expression {
    if (!element.forEach) {
        return fragmentNodes;
    }

    let expression = fragmentNodes;
    if (t.isArrayExpression(expression) && expression.elements.length === 1) {
        expression = expression.elements[0] as t.Expression;
    }

    return applyInlineFor(element, expression);
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

function elementDataBag(element: IRElement): t.ObjectExpression {
    const { classMap, className, style, styleMap, attrs, props, on, forKey } = element;
    const data: t.ObjectProperty[] = [];

    if (className) {
        const { expression: classExpression } = bindExpression(className, element);
        data.push(
            t.objectProperty(t.identifier('className'), classExpression),
        );
    }

    if (classMap) {
        const classMapObj = objectToAST(classMap, () => t.booleanLiteral(true));
        data.push(t.objectProperty(t.identifier('classMap'), classMapObj));
    }

    if (styleMap) {
        const styleObj = objectToAST(styleMap, (key) => (
            typeof styleMap[key] === 'number' ?
                t.numericLiteral(styleMap[key] as number) :
                t.stringLiteral(styleMap[key] as string)
        ));

        data.push(t.objectProperty(t.identifier('styleMap'), styleObj));
    }

    if (style) {
        const { expression: styleExpression } = bindExpression(style, element);
        data.push(t.objectProperty(t.identifier('style'), styleExpression));
    }

    if (attrs) {
        const atrsObj = objectToAST(attrs, (key) => computeAttrValue(attrs[key], element));
        data.push(t.objectProperty(t.identifier('attrs'), atrsObj));
    }

    if (props) {
        const propsObj = objectToAST(props, (key) => computeAttrValue(props[key], element));
        data.push(t.objectProperty(t.identifier('props'), propsObj));
    }

    if (forKey) {
        data.push(t.objectProperty(t.identifier('key'), forKey));
    }

    if (on) {
        const onObj = objectToAST(on, (key) => {
            const { expression: handler } =  bindExpression(on[key], element);
            const boundHandler = t.callExpression(RENDER_PRIMITIVE_API.BIND, [ handler ]);

            // #439 - The handler can only be memorized if it is bound to component instance
            const id = getMemberExpressionRoot(handler as t.MemberExpression);
            const shouldBeMemorized = isComponentProp(id, element);

            return shouldBeMemorized ? memorization.memorize(boundHandler) : boundHandler;
        });
        data.push(t.objectProperty(t.identifier('on'), onObj));
    }

    return t.objectExpression(data);
}

function shouldFlatten(element: IRElement): boolean {
    return element.children.some((child) => (
        isElement(child) && (
            (isSlot(child) || !!child.forEach || !!child.forOf) ||
            isTemplate(child) && shouldFlatten(child)
        )
    ));
}

const TEMPLATE_FUNCTION = template(
    `export default function NAME(API, CMP, SLOT_SET, CONTEXT) {
        return STATEMENT;
    }`,
    { sourceType: 'module' },
);

const isTemplate = (element: IRElement) => element.tag === 'template';
const isSlot = (element: IRElement) => element.tag === 'slot';

export function transform(
    root: IRNode,
): t.Expression {
    const stack = new Stack< t.Expression >();
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

                const babelTextNode = createText(value);
                (stack.peek() as t.ArrayExpression).elements.push(babelTextNode);
            },
        },

        element: {
            enter() {
                const childrenEpression = t.arrayExpression([]);
                stack.push(childrenEpression);
            },

            exit(element: IRElement) {
                let children = stack.pop();

                if (shouldFlatten(element)) {
                    if (t.isArrayExpression(children)) {
                        children = element.children.length === 1 ?
                            children.elements[0] as t.Expression :
                            t.callExpression(RENDER_PRIMITIVE_API.FLATTENING, [children]);
                    }
                }

                if (isTemplate(element)) {
                    transformTemplate(element, children);
                } else {
                    transformElement(element, children);
                }
            },
        },
    });

    function transformElement(element: IRElement, children: t.Expression) {
        const databag = elementDataBag(element);

        let babelElement: t.Expression;
        if (isCustomElement(element)) {
            // Traverse custom components slots and it to the databag
            transformSlotset(element, databag);

            // Make sure to register the component
            const componentClassName = element.component!;

            babelElement = createCustomElement(
                element.tag,
                identifierFromComponentName(componentClassName),
                databag,
            );
        } else if (isSlot(element)) {
            const { slotName } = element;

            const slotIdentifier = DEFAULT_SLOT_NAME === slotName ?
                t.identifier(DEFAULT_SLOT_NAME) :
                t.stringLiteral(slotName);

            const isComputedProperty = !t.isIdentifier(slotIdentifier);

            babelElement = t.logicalExpression(
                '||',
                t.memberExpression(
                    t.identifier(TEMPLATE_PARAMS.SLOT_SET),
                    slotIdentifier,
                    isComputedProperty,
                ),
                children,
            );
        } else {
            babelElement = createElement(
                element.tag,
                databag,
                children,
            );
        }

        babelElement = applyInlineIf(element, babelElement);
        babelElement = applyInlineFor(element, babelElement);

        (stack.peek() as t.ArrayExpression).elements.push(babelElement);
    }

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
                    transform(slotRoot),
                ),
            );
        });

        databag.properties.push(
            t.objectProperty(t.stringLiteral('slotset'), t.objectExpression(slots)),
        );
    }

    return (stack.peek() as t.ArrayExpression).elements[0] as t.Expression;
}

/**
 * Generate metadata that will be attached to the template function
 */
function generateTemplateMetadata(metadata: CompilationMetadata): t.ExpressionStatement[] {
    const { definedSlots } = metadata;
    const metadataExpressions: t.ExpressionStatement[] = [];

    // Generate the slots property on template function if slots are defined in the template
    // tmpl.slots = ['$default$', 'x']
    if (definedSlots.length) {
        const slotsProperty = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier('slots'),
        );

        const slotsArray = t.arrayExpression(
            metadata.definedSlots.map((slot) => t.stringLiteral(slot)),
        );

        const slotsMetadata = t.assignmentExpression('=', slotsProperty, slotsArray);
        metadataExpressions.push(
            t.expressionStatement(slotsMetadata),
        );
    }

    return metadataExpressions;
}

export default function(templateRoot: IRElement, metadata: CompilationMetadata): CompilationOutput {
    memorization.reset();

    const statement = transform(templateRoot);

    const imports = metadata.templateDependencies.map((cmpClassName) => (
        importFromComponentName(cmpClassName)
    ));

    const content = TEMPLATE_FUNCTION({
        NAME: t.identifier(TEMPLATE_FUNCTION_NAME),
        API: t.identifier(TEMPLATE_PARAMS.API),
        CMP: t.identifier(TEMPLATE_PARAMS.INSTANCE),
        SLOT_SET: t.identifier(TEMPLATE_PARAMS.SLOT_SET),
        CONTEXT: t.identifier(TEMPLATE_PARAMS.CONTEXT),
        STATEMENT:  statement,
    }) as t.ExportDefaultDeclaration;

    const templateMetadata = generateTemplateMetadata(metadata);

    const program = t.program([
        ...imports,
        content,
        ...templateMetadata,
    ]);

    const { code } = generate(program);
    return {
        ast: program,
        code,
    };
}
