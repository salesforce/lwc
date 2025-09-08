/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ParserDiagnostics, invariant } from '@lwc/errors';
import { walk } from 'estree-walker';
import { type Options, parseExpressionAt, type Expression as AcornExpression } from 'acorn';
import * as t from '../../shared/estree';
import type { Expression, SourceLocation } from '../../shared/types';
import type { BaseNode } from 'estree';
import type { Node } from 'estree-walker';

export const OPENING_CURLY_LEN = 1;
export const CLOSING_CURLY_LEN = 1;
export const CLOSING_CURLY_BRACKET = 0x7d;
export const TRAILING_SPACES_AND_PARENS = /[\s)]*/;

function getTrailingChars(str: string): string {
    return TRAILING_SPACES_AND_PARENS.exec(str)![0];
}

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

function validateNode(node: BaseNode, _parent: BaseNode | null, isWithinArrowFn: boolean) {
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

function validateExpressionAst(rootNode: BaseNode): asserts rootNode is Expression {
    let arrowFnScopeDepth = 0;
    // TODO [#3370]: when the template expression flag is removed, the
    // ComplexExpression type should be redefined as an ESTree Node. Doing
    // so when the flag is still in place results in a cascade of required
    // type changes across the codebase.
    walk(rootNode as Node, {
        enter(node: Node, parent: Node | null) {
            validateNode(node, parent, !!arrowFnScopeDepth);
            if (t.isArrowFunctionExpression(node)) {
                arrowFnScopeDepth++;
            }
        },
        leave(node: Node) {
            if (t.isArrowFunctionExpression(node)) {
                arrowFnScopeDepth--;
            }
        },
    });
}

/**
 * This function checks for "unbalanced" extraneous parentheses surrounding the expression.
 *
 * Examples of balanced extraneous parentheses (validation passes):
 * - `{(foo.bar)}`        <-- the MemberExpressions does not account for the surrounding parens
 * - `{(foo())}`          <-- the CallExpression does not account for the surrounding parens
 * - `{((foo ?? bar)())}` <-- the CallExpression does not account for the surrounding parens
 *
 * Examples of unbalanced extraneous parentheses (validation fails):
 * - `{(foo.bar))}`       <-- there is an extraneous trailing paren
 * - `{foo())}`           <-- there is an extraneous trailing paren
 *
 * Examples of no extraneous parentheses (validation passes):
 * - `{foo()}`            <-- the CallExpression accounts for the trailing paren
 * - `{(foo ?? bar).baz}` <-- the outer MemberExpression accounts for the leading paren
 * - `{(foo).bar}`        <-- the outer MemberExpression accounts for the leading paren
 *
 * Notably, no examples of extraneous leading parens could be found - these result in a
 * parsing error in Acorn. However, this function still checks, in case there is an
 * unknown expression that would parse with an extraneous leading paren.
 * @param leadingChars
 * @param trailingChars
 */
function validateMatchingExtraParens(leadingChars: string, trailingChars: string) {
    const numLeadingParens = leadingChars.split('(').length - 1;
    const numTrailingParens = trailingChars.split(')').length - 1;
    invariant(
        numLeadingParens === numTrailingParens,
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        ['expression must have balanced parentheses.']
    );
}

export function validateComplexExpression(
    expression: AcornExpression,
    source: string,
    templateSource: string,
    expressionStart: number,
    options: Options,
    location: SourceLocation
): {
    expression: Expression;
    raw: string;
} {
    const leadingChars = source.slice(expressionStart + OPENING_CURLY_LEN, expression.start);
    const trailingChars = getTrailingChars(source.slice(expression.end));
    const idxOfClosingBracket = expression.end + trailingChars.length;
    // Capture text content between the outer curly braces, inclusive.
    const expressionTextNodeValue = source.slice(
        expressionStart,
        idxOfClosingBracket + CLOSING_CURLY_LEN
    );

    validateExpressionAst(expression);
    validateMatchingExtraParens(leadingChars, trailingChars);
    invariant(
        source.codePointAt(idxOfClosingBracket) === CLOSING_CURLY_BRACKET,
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        ['expression must end with curly brace.']
    );

    /*
        This second parsing step should never be needed, but accounts for cases 
        where a portion of the expression has been incorrectly parsed by the html parser. 
        - E.g. the expression {call("}<c-status></c-status>")} would be parsed by parse5 like this: 
            1. {call("} (will next be evaluated as an expression)
            2. <c-status></c-status> (will be evaluated as an element)
            3. ")} (text node)
        - The expression: call(" is invalid so the parser would have already failed to validate. But if, somehow a valid expression was produced, this step
           would compare the length of that expression to the length of the expression parsed from the raw template source and then compares the lengths
           of the two expressions. If the two expressions don't match in length, that indicates parse5 interpreted a portion of the expression as HTML 
           and we should throw.
    */
    const templateExpression = parseExpressionAt(
        templateSource,
        expressionStart + OPENING_CURLY_LEN,
        options
    );

    invariant(
        expression.end === templateExpression.end,
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        ['expression incorrectly formed']
    );

    return {
        expression: { ...expression, location },
        raw: expressionTextNodeValue,
    };
}
