/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { walk } from 'estree-walker';
import { ParserDiagnostics, invariant } from '@lwc/errors';
import * as t from '../shared/estree';
import { ComplexExpression } from '../shared/types';
import { TEMPLATE_PARAMS } from '../shared/constants';
import type CodeGen from './codegen';

type VariableName = string;
type VariableShadowingMultiplicity = number;
type VariableNames = Set<string>;

/**
 * Bind the passed expression to the component instance. It applies the following
 * transformation to the expression:
 *    {value} --> {$cmp.value}
 *    {value[index]} --> {$cmp.value[$cmp.index]}
 *    {foo ?? bar} --> {$cmp.foo ?? $cmp.bar}
 *    {foo?.bar} --> {$cmp.foo?.bar}
 *
 * However, parameter variables are not be transformed in this way. For example,
 * the following transformations do not happen:
 *    {(foo) => foo && bar} -> {(foo) => $cmp.foo && $cmp.bar}
 *    {(foo) => foo && bar} -> {($cmp.foo) => foo && $cmp.bar}
 *    {(foo) => foo && bar} -> {($cmp.foo) => $cmp.foo && $cmp.bar}
 *
 * Instead, the scopes are respected:
 *    {(foo) => foo && $cmp.bar}
 *
 * Similar checks occur for local identifiers introduced via for:each or similar.
 */
export function bindComplexExpression(
    expression: ComplexExpression,
    codeGen: CodeGen
): t.Expression {
    const expressionScopes = new ExpressionScopes();
    walk(expression, {
        enter(node, _parent) {
            // Function and class expressions are not permitted in template expressions,
            // only arrow function expressions.
            if (t.isArrowFunctionExpression(node)) {
                expressionScopes.enterScope(node);
            }
        },

        leave(node, parent) {
            if (t.isArrowFunctionExpression(node)) {
                expressionScopes.exitScope(node);
            } else if (
                parent !== null &&
                t.isIdentifier(node) &&
                // Acorn parses `undefined` as an Identifier.
                node.name !== 'undefined' &&
                !(t.isMemberExpression(parent) && parent.property === node) &&
                !(t.isProperty(parent) && parent.key === node) &&
                !codeGen.isLocalIdentifier(node) &&
                !expressionScopes.isScopedToExpression(node)
            ) {
                this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
            }
        },
    });

    return expression as t.Expression;
}

/**
 * Track the variables that come in and out of scope in various parts of a
 * template expression. Arrow functions can return arrow functions, which can lead to
 * variable shadowing, which needs to be handled correctly.
 */
class ExpressionScopes {
    variableShadowingCount = new Map<VariableName, VariableShadowingMultiplicity>();
    arrowFnVariables = new Map<t.ArrowFunctionExpression, Set<VariableName>>();

    enterScope(node: t.ArrowFunctionExpression) {
        const variableNamesIntroduced: VariableNames = new Set();
        for (const param of node.params) {
            collectParams(param, variableNamesIntroduced);
        }
        for (const varName of variableNamesIntroduced) {
            this.variableShadowingCount.set(
                varName,
                (this.variableShadowingCount.get(varName) ?? 0) + 1
            );
        }
        this.arrowFnVariables.set(node, variableNamesIntroduced);
    }

    exitScope(node: t.ArrowFunctionExpression) {
        const varNames = this.arrowFnVariables.get(node);
        if (varNames) {
            for (const varName of varNames) {
                this.variableShadowingCount.set(
                    varName,
                    this.variableShadowingCount.get(varName)! - 1
                );
            }
        }
    }

    // If a variable was introduced as an arrow function parameter and is still
    // in scope, return true. Otherwise, return false.
    isScopedToExpression(node: t.Identifier): boolean {
        return !!this.variableShadowingCount.get(node.name);
    }
}

function collectParams(node: t.BaseNode, vars: VariableNames) {
    if (t.isIdentifier(node)) {
        collectParamsFromIdentifier(node, vars);
    } else if (t.isObjectPattern(node)) {
        collectParamsFromObjectPattern(node, vars);
    } else if (t.isProperty(node)) {
        collectParamsFromProperty(node, vars);
    } else if (t.isArrayPattern(node)) {
        collectParamsFromArrayPattern(node, vars);
    } else if (t.isRestElement(node)) {
        collectParamsFromRestElement(node, vars);
    } else if (t.isAssignmentPattern(node)) {
        collectParamsFromAssignmentPattern(node, vars);
    } else if (t.isMemberExpression(node)) {
        collectParamsFromMemberExpression(node, vars);
    } else {
        invariant(false, ParserDiagnostics.INVALID_EXPR_ARROW_FN_PARAM, [node.type]);
    }
}

function collectParamsFromIdentifier(node: t.Identifier, vars: VariableNames) {
    vars.add(node.name);
}

function collectParamsFromObjectPattern(node: t.ObjectPattern, vars: VariableNames) {
    for (const property of node.properties) {
        collectParams(property, vars);
    }
}

function collectParamsFromProperty(node: t.Property, vars: VariableNames) {
    collectParams(node.value, vars);
}

function collectParamsFromArrayPattern(node: t.ArrayPattern, vars: VariableNames) {
    for (const element of node.elements) {
        // Elements of an array pattern can be null.
        if (element) {
            collectParams(element, vars);
        }
    }
}

function collectParamsFromRestElement(node: t.RestElement, vars: VariableNames) {
    collectParams(node.argument, vars);
}

function collectParamsFromAssignmentPattern(_node: t.AssignmentPattern, _vars: VariableNames) {
    invariant(false, ParserDiagnostics.INVALID_EXPR_ARROW_FN_PARAM, ['default parameters']);
}

function collectParamsFromMemberExpression(_node: t.MemberExpression, _vars: VariableNames) {
    // It is unclear how this condition could ever be reached. But because it is allowed by
    // the AST, we'll validate anyway.
    invariant(false, ParserDiagnostics.INVALID_EXPR_ARROW_FN_PARAM, ['member expressions']);
}
