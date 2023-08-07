/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ParserDiagnostics, invariant } from '@lwc/errors';
import { walk } from 'estree-walker';
import * as t from '../../shared/estree';
import type { BaseNode } from 'estree';

const ALWAYS_INVALID_TYPES = new Map(
    Object.entries({
        AwaitExpression: 'await expressions',
        ClassExpression: 'classes',
        FunctionExpression: 'function expressions',
        ImportExpression: 'imports',
        MetaProperty: 'import.meta',
        NewExpression: 'object instantiation',
        RegExpLiteral: 'regular expression literals',
        SequenceExpression: 'comma operators',
        Super: '`super`',
        ThisExpression: '`this`',
        YieldExpression: '`yield`',
    })
);
const STATEMENT_TYPES = new Set([
    'BlockStatement',
    'BreakStatement',
    'ClassDeclaration',
    'ContinueStatement',
    'DebuggerStatement',
    'DeclareClass',
    'DeclareExportAllDeclaration',
    'DeclareExportDeclaration',
    'DeclareFunction',
    'DeclareInterface',
    'DeclareModule',
    'DeclareModuleExports',
    'DeclareOpaqueType',
    'DeclareTypeAlias',
    'DeclareVariable',
    'DoWhileStatement',
    'EmptyStatement',
    'ExportAllDeclaration',
    'ExportDefaultDeclaration',
    'ExportNamedDeclaration',
    'ExpressionStatement',
    'ForInStatement',
    'ForOfStatement',
    'ForStatement',
    'FunctionDeclaration',
    'IfStatement',
    'ImportDeclaration',
    'LabeledStatement',
    'ReturnStatement',
    'Statement',
    'SwitchStatement',
    'ThrowStatement',
    'TryStatement',
    'VariableDeclaration',
    'WhileStatement',
    'WithStatement',
]);
const MUTATION_TYPES = new Set(['AssignmentExpression', 'UpdateExpression']);

function validateArrowFunction(node: t.ArrowFunctionExpression) {
    invariant(node.body.type !== 'BlockStatement', ParserDiagnostics.INVALID_EXPR_ARROW_FN_BODY);
    invariant(!node.async, ParserDiagnostics.INVALID_EXPR_ARROW_FN_KIND, ['async']);
    // This condition should never occur, unless the spec changes. However, it is
    // permitted by the ESTree representation, so we'll check for it just in case.
    invariant(!node.generator, ParserDiagnostics.INVALID_EXPR_ARROW_FN_KIND, ['generators']);
}

function validateUnaryExpression(node: t.UnaryExpression) {
    invariant(node.operator !== 'delete', ParserDiagnostics.INVALID_EXPR_DELETE_OP);
}

function validateLiteral(node: t.Literal) {
    // Because there may be a need for a polyfill in older browsers, and because there
    // isn't an obvious need for their inclusion, big ints are disallowed in template
    // expressions.
    invariant(
        (node as t.BigIntLiteral).bigint === undefined,
        ParserDiagnostics.INVALID_EXPR_PROHIBITED_NODE_TYPE,
        ['BigInts']
    );
    // Regular expression literals are difficult to visually parse, and
    // may be difficult to programatically parse with future parsing methods. For those
    // reasons, they are also disallowed.
    invariant(
        (node as t.RegExpLiteral).regex === undefined,
        ParserDiagnostics.INVALID_EXPR_PROHIBITED_NODE_TYPE,
        ['regular expression literals']
    );
}

function validateNode(node: BaseNode, _parent: BaseNode, isWithinArrowFn: boolean) {
    invariant(
        !node.leadingComments?.length && !node.trailingComments?.length,
        ParserDiagnostics.INVALID_EXPR_COMMENTS_DISALLOWED
    );
    invariant(
        !STATEMENT_TYPES.has(node.type),
        ParserDiagnostics.INVALID_EXPR_STATEMENTS_PROHIBITED
    );
    invariant(
        !(MUTATION_TYPES.has(node.type) && !isWithinArrowFn),
        ParserDiagnostics.INVALID_EXPR_MUTATION_OUTSIDE_ARROW
    );
    invariant(
        !ALWAYS_INVALID_TYPES.has(node.type),
        ParserDiagnostics.INVALID_EXPR_PROHIBITED_NODE_TYPE,
        [ALWAYS_INVALID_TYPES.get(node.type)]
    );

    if (t.isArrowFunctionExpression(node)) {
        validateArrowFunction(node);
    } else if (t.isUnaryExpression(node)) {
        validateUnaryExpression(node);
    } else if (t.isLiteral(node)) {
        validateLiteral(node);
    }
}

export function validateExpressionAst(rootNode: BaseNode) {
    let arrowFnScopeDepth = 0;
    walk(rootNode, {
        enter(node: BaseNode, parent: BaseNode) {
            validateNode(node, parent, !!arrowFnScopeDepth);
            if (t.isArrowFunctionExpression(node)) {
                arrowFnScopeDepth++;
            }
        },
        leave(node: BaseNode) {
            if (t.isArrowFunctionExpression(node)) {
                arrowFnScopeDepth--;
            }
        },
    });
}
