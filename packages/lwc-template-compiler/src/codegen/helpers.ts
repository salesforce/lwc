import * as t from 'babel-types';
import toCamelCase from 'camelcase';

import State from '../state';
import { isElement } from '../shared/ir';
import { IRElement } from '../shared/types';
import { TEMPLATE_FUNCTION_NAME } from '../shared/constants';
import { kebabcaseToCamelcase } from "../shared/naming";

export function identifierFromComponentName(name: string): t.Identifier {
    return t.identifier(`_${toCamelCase(name)}`);
}
export function getKeyGenerator() {
    let counter = 1;
    return () => counter++;
}

export { kebabcaseToCamelcase };

export function getMemberExpressionRoot(
    expression: t.MemberExpression,
): t.Identifier {
    let current: t.Expression | t.Identifier = expression;
    while (t.isMemberExpression(current)) {
        current = current.object;
    }

    return current as t.Identifier;
}

export function objectToAST(
    obj: object,
    valueMapper: (key: string) => t.Expression,
): t.ObjectExpression {
    return t.objectExpression(
        Object.keys(obj).map(key =>
            t.objectProperty(t.stringLiteral(key), valueMapper(key)),
        ),
    );
}

/** Returns true if the passed element is a template element */
export function isTemplate(element: IRElement) {
    return element.tag === 'template';
}

/** Returns true if the passed element is a slot element */
export function isSlot(element: IRElement) {
    return element.tag === 'slot';
}

/**
 * Returns true if the passed element should be flattened
 * TODO: Move this logic into the optimizing compiler. This kind of
 *       optimization should be done before the actual code generation.
 */
export function shouldFlatten(element: IRElement): boolean {
    return element.children.some(
        child =>
            isElement(child) &&
            (!!child.forEach ||
                !!child.forOf ||
                (isTemplate(child) && shouldFlatten(child))),
    );
}

export function destructuringAssignmentFromObject(
    target: t.Identifier | t.MemberExpression,
    keys: t.ObjectProperty[],
    type: string = 'const',
) {
    return t.variableDeclaration(type as any, [
        t.variableDeclarator(
            t.objectPattern(
                keys as any,
            ),
            target,
        ),
    ]);
}

export function generateTemplateMetadata(state: State): t.ExpressionStatement[] {
    const metadataExpressions: t.ExpressionStatement[] = [];

    // Generate the slots property on template function if slots are defined in the template:
    //      tmpl.slots = ['', 'x']
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
