import * as t from 'babel-types';
import * as toCamelCase from 'camelcase';

import { isElement } from '../shared/ir';
import { IRElement } from '../shared/types';

export function identifierFromComponentName(name: string): t.Identifier {
    return t.identifier(`_${toCamelCase(name)}`);
}
export function getKeyGenerator() {
    let counter = 1;
    return () => counter++;
}

export function getMemberExpressionRoot(
    expression: t.MemberExpression,
): t.Identifier {
    let current: t.Expression | t.Identifier = expression;
    while (t.isMemberExpression(current)) {
        current = current.object;
    }

    return current as t.Identifier;
}

export function importFromComponentName(name: string): t.ImportDeclaration {
    const localComponentIdentifier = identifierFromComponentName(name);
    return t.importDeclaration(
        [t.importDefaultSpecifier(localComponentIdentifier)],
        t.stringLiteral(name),
    );
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
