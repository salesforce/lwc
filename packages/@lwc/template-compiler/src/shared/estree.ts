/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type * as t from 'estree';

export function isIdentifier(node: t.BaseNode): node is t.Identifier {
    return node.type === 'Identifier';
}

export function isMemberExpression(node: t.BaseNode): node is t.MemberExpression {
    return node.type === 'MemberExpression';
}

export function isArrayExpression(node: t.BaseNode): node is t.ArrayExpression {
    return node.type === 'ArrayExpression';
}

export function isObjectExpression(node: t.BaseNode): node is t.ObjectExpression {
    return node.type === 'ObjectExpression';
}

export function isProperty(node: t.BaseNode): node is t.Property {
    return node.type === 'Property';
}

export function isArrowFunctionExpression(node: t.BaseNode): node is t.ArrowFunctionExpression {
    return node.type === 'ArrowFunctionExpression';
}

export function isObjectPattern(node: t.BaseNode): node is t.ObjectPattern {
    return node.type === 'ObjectPattern';
}

export function isArrayPattern(node: t.BaseNode): node is t.ArrayPattern {
    return node.type === 'ArrayPattern';
}

export function isRestElement(node: t.BaseNode): node is t.RestElement {
    return node.type === 'RestElement';
}

export function isAssignmentPattern(node: t.BaseNode): node is t.AssignmentPattern {
    return node.type === 'AssigmentPattern';
}

export function isUnaryExpression(node: t.BaseNode): node is t.UnaryExpression {
    return node.type === 'UnaryExpression';
}

export function identifier(name: string, config?: Partial<t.Identifier>): t.Identifier {
    return {
        type: 'Identifier',
        name,
        ...config,
    };
}

export function isLiteral(node: t.BaseNode): node is t.Literal {
    return node.type === 'Literal';
}

export function memberExpression(
    object: t.MemberExpression['object'],
    property: t.MemberExpression['property'],
    config?: Partial<t.MemberExpression>
): t.MemberExpression {
    return {
        type: 'MemberExpression',
        object,
        property,
        computed: false,
        optional: false,
        ...config,
    };
}

export function callExpression(
    callee: t.CallExpression['callee'],
    args: t.CallExpression['arguments'],
    config?: Partial<t.CallExpression>
): t.CallExpression {
    return {
        type: 'CallExpression',
        callee,
        arguments: args,
        optional: false,
        ...config,
    };
}

export function literal(
    value: t.SimpleLiteral['value'],
    config?: Partial<t.SimpleLiteral>
): t.SimpleLiteral {
    return {
        type: 'Literal',
        value,
        ...config,
    };
}

export function conditionalExpression(
    test: t.ConditionalExpression['test'],
    consequent: t.ConditionalExpression['consequent'],
    alternate: t.ConditionalExpression['alternate'],
    config?: Partial<t.ConditionalExpression>
): t.ConditionalExpression {
    return {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
        ...config,
    };
}

export function unaryExpression(
    operator: t.UnaryExpression['operator'],
    argument: t.UnaryExpression['argument'],
    config?: Partial<t.UnaryExpression>
): t.UnaryExpression {
    return {
        type: 'UnaryExpression',
        argument,
        operator,
        prefix: true,
        ...config,
    };
}

export function binaryExpression(
    operator: t.BinaryExpression['operator'],
    left: t.BinaryExpression['left'],
    right: t.BinaryExpression['right'],
    config?: Partial<t.BinaryExpression>
): t.BinaryExpression {
    return {
        type: 'BinaryExpression',
        left,
        operator,
        right,
        ...config,
    };
}

export function logicalExpression(
    operator: t.LogicalExpression['operator'],
    left: t.LogicalExpression['left'],
    right: t.LogicalExpression['right'],
    config?: Partial<t.LogicalExpression>
): t.LogicalExpression {
    return {
        type: 'LogicalExpression',
        operator,
        left,
        right,
        ...config,
    };
}

export function assignmentExpression(
    operator: t.AssignmentExpression['operator'],
    left: t.AssignmentExpression['left'],
    right: t.AssignmentExpression['right'],
    config?: Partial<t.AssignmentExpression>
): t.AssignmentExpression {
    return {
        type: 'AssignmentExpression',
        operator,
        left,
        right,
        ...config,
    };
}

export function property(
    key: t.Property['key'],
    value: t.Property['value'],
    config?: Partial<t.Property>
): t.Property {
    return {
        type: 'Property',
        key,
        value,
        kind: 'init',
        computed: false,
        method: false,
        shorthand: false,
        ...config,
    };
}

export function spreadElement(argument: t.Expression): t.SpreadElement {
    return {
        type: 'SpreadElement',
        argument,
    };
}

export function assignmentProperty(
    key: t.AssignmentProperty['key'],
    value: t.AssignmentProperty['value'],
    config?: Partial<t.AssignmentProperty>
): t.AssignmentProperty {
    return {
        type: 'Property',
        key,
        value,
        kind: 'init',
        computed: false,
        method: false,
        shorthand: false,
        ...config,
    };
}

export function objectExpression(
    properties: t.ObjectExpression['properties'],
    config?: Partial<t.ObjectExpression>
): t.ObjectExpression {
    return {
        type: 'ObjectExpression',
        properties,
        ...config,
    };
}

export function objectPattern(
    properties: t.ObjectPattern['properties'],
    config?: Partial<t.ObjectPattern>
): t.ObjectPattern {
    return {
        type: 'ObjectPattern',
        properties,
        ...config,
    };
}

export function arrayExpression(
    elements: t.ArrayExpression['elements'],
    config?: Partial<t.ArrayExpression>
): t.ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements,
        ...config,
    };
}

export function expressionStatement(
    expression: t.ExpressionStatement['expression'],
    config?: Partial<t.ExpressionStatement>
): t.ExpressionStatement {
    return {
        type: 'ExpressionStatement',
        expression,
        ...config,
    };
}

export function taggedTemplateExpression(
    tag: Expression,
    quasi: t.TemplateLiteral
): t.TaggedTemplateExpression {
    return {
        type: 'TaggedTemplateExpression',
        tag,
        quasi,
    };
}

export function templateLiteral(
    quasis: t.TemplateElement[],
    expressions: t.Expression[]
): t.TemplateLiteral {
    return {
        type: 'TemplateLiteral',
        quasis,
        expressions,
    };
}

export function assignmentPattern(left: t.Pattern, right: t.Expression): t.AssignmentPattern {
    return {
        type: 'AssignmentPattern',
        left,
        right,
    };
}

export function functionExpression(
    id: null | t.Identifier,
    params: t.FunctionExpression['params'],
    body: t.FunctionExpression['body'],
    config?: Partial<t.FunctionExpression>
): t.FunctionExpression {
    return {
        type: 'FunctionExpression',
        id,
        params,
        body,
        ...config,
    };
}

export function functionDeclaration(
    id: t.Identifier,
    params: t.FunctionDeclaration['params'],
    body: t.FunctionDeclaration['body'],
    config?: Partial<t.FunctionDeclaration>
): t.FunctionDeclaration {
    return {
        type: 'FunctionDeclaration',
        id,
        params,
        body,
        ...config,
    };
}

export function blockStatement(
    body: t.BlockStatement['body'],
    config?: Partial<t.BlockStatement>
): t.BlockStatement {
    return {
        type: 'BlockStatement',
        body,
        ...config,
    };
}

export function returnStatement(
    argument: t.ReturnStatement['argument'],
    config?: Partial<t.ReturnStatement>
): t.ReturnStatement {
    return {
        type: 'ReturnStatement',
        argument,
        ...config,
    };
}

export function variableDeclarator(
    id: t.VariableDeclarator['id'],
    init: t.VariableDeclarator['init'],
    config?: Partial<t.VariableDeclarator>
): t.VariableDeclarator {
    return {
        type: 'VariableDeclarator',
        id,
        init,
        ...config,
    };
}

export function variableDeclaration(
    kind: t.VariableDeclaration['kind'],
    declarations: t.VariableDeclaration['declarations'],
    config?: Partial<t.VariableDeclaration>
): t.VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind,
        declarations,
        ...config,
    };
}

export function importDeclaration(
    specifiers: t.ImportDeclaration['specifiers'],
    source: t.ImportDeclaration['source'],
    config?: Partial<t.ImportDeclaration>
): t.ImportDeclaration {
    return {
        type: 'ImportDeclaration',
        specifiers,
        source,
        ...config,
    };
}

export function importDefaultSpecifier(
    local: t.ImportDefaultSpecifier['local'],
    config?: Partial<t.ImportDefaultSpecifier>
): t.ImportDefaultSpecifier {
    return {
        type: 'ImportDefaultSpecifier',
        local,
        ...config,
    };
}

export function importSpecifier(
    imported: t.ImportSpecifier['imported'],
    local: t.ImportSpecifier['local'],
    config?: Partial<t.ImportSpecifier>
): t.ImportSpecifier {
    return {
        type: 'ImportSpecifier',
        imported,
        local,
        ...config,
    };
}
export function exportDefaultDeclaration(
    declaration: t.ExportDefaultDeclaration['declaration'],
    config?: Partial<t.ExportDefaultDeclaration>
): t.ExportDefaultDeclaration {
    return {
        type: 'ExportDefaultDeclaration',
        declaration,
        ...config,
    };
}

export function program(body: t.Program['body'], config?: Partial<t.Program>): t.Program {
    return {
        type: 'Program',
        sourceType: 'module',
        body,
        ...config,
    };
}

export function comment(content: string): t.Comment {
    return {
        type: 'Block',
        value: content,
    };
}

export type BaseNode = t.BaseNode;
export type Identifier = t.Identifier;
export type MemberExpression = t.MemberExpression;
export type CallExpression = t.CallExpression;
export type SimpleLiteral = t.SimpleLiteral;
export type Literal = t.Literal;
export type BigIntLiteral = t.BigIntLiteral;
export type RegExpLiteral = t.RegExpLiteral;
export type ConditionalExpression = t.ConditionalExpression;
export type UnaryExpression = t.UnaryExpression;
export type BinaryExpression = t.BinaryExpression;
export type LogicalExpression = t.LogicalExpression;
export type AssignmentExpression = t.AssignmentExpression;
export type AssignmentProperty = t.AssignmentProperty;
export type Property = t.Property;
export type ObjectExpression = t.ObjectExpression;
export type ObjectPattern = t.ObjectPattern;
export type ArrayExpression = t.ArrayExpression;
export type ArrayPattern = t.ArrayPattern;
export type RestElement = t.RestElement;
export type ExpressionStatement = t.ExpressionStatement;
export type FunctionExpression = t.FunctionExpression;
export type Expression = t.Expression;
export type FunctionDeclaration = t.FunctionDeclaration;
export type ArrowFunctionExpression = t.ArrowFunctionExpression;
export type AssignmentPattern = t.AssignmentPattern;
export type BlockStatement = t.BlockStatement;
export type ReturnStatement = t.ReturnStatement;
export type VariableDeclarator = t.VariableDeclarator;
export type VariableDeclaration = t.VariableDeclaration;
export type ImportDeclaration = t.ImportDeclaration;
export type ImportDefaultSpecifier = t.ImportDefaultSpecifier;
export type ImportSpecifier = t.ImportSpecifier;
export type ExportDefaultDeclaration = t.ExportDefaultDeclaration;
export type Statement = t.Statement;
export type Program = t.Program;
