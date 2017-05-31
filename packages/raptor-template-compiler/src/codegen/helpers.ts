import * as t from 'babel-types';
import * as toCamelCase from 'camelcase';

import {
    TEMPLATE_PARAMS,
    RENDER_PRIMITIVES,
} from './constants';

export const RENDER_PRIMITIVE_API: { [key: string]: t.MemberExpression } = {};

Object.keys(RENDER_PRIMITIVES).forEach((primitive) => {
    RENDER_PRIMITIVE_API[primitive] = t.memberExpression(
        t.identifier(TEMPLATE_PARAMS.API),
        t.identifier(RENDER_PRIMITIVES[primitive]),
    );
});

export function createElement(
    tagName: string,
    data: t.ObjectExpression,
    children: t.Expression,
): t.CallExpression {
    return t.callExpression(
        RENDER_PRIMITIVE_API.ELEMENT,
        [
            t.stringLiteral(tagName),
            data,
            children,
        ],
    );
}

export function createCustomElement(
    tagName: string,
    componentClass: t.Identifier,
    data: t.ObjectExpression,
) {
    return t.callExpression(
        RENDER_PRIMITIVE_API.CUSTOM_ELEMENT,
        [
            t.stringLiteral(tagName),
            componentClass,
            data,
        ],
    );
}

export function createText(value: string | t.Expression): t.Expression {
    return typeof value === 'string' ?
        t.callExpression(RENDER_PRIMITIVE_API.TEXT, [ t.stringLiteral(value) ]) :
        t.callExpression(RENDER_PRIMITIVE_API.DYNAMIC, [ value ]);
}

export function identifierFromComponentName(name: string): t.Identifier {
    return t.identifier(`_${toCamelCase(name)}`);
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
        Object.keys(obj).map((key) => (
            t.objectProperty(t.stringLiteral(key), valueMapper(key))
        )),
    );
}
