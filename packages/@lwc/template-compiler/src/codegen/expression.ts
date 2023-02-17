import { walk } from 'estree-walker';
import * as t from '../shared/estree';
import { Expression, Literal } from '../shared/types';
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
 * However, parameter variables are not be transformed in this way. For example, this:
 *
 */
export function bindExpression(expression: Expression | Literal, codeGen: CodeGen): t.Expression {
    const expressionScopes = new ExpressionScopes();
    walk(expression, {
        enter(node, _parent) {
            if (t.isArrowFunctionExpression(node)) {
                expressionScopes.enterScope(node);
            }
        },

        leave(node, parent) {
            if (t.isArrowFunctionExpression(node)) {
                expressionScopes.exitScope(node);
            } else if (
                // eslint-disable-next-line
                // TODO: provide more elaborate detection for Identifiers that may
                //       need special handling, as is the case with member expressions

                parent !== null &&
                t.isIdentifier(node) &&
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

    // If a variable was introduced in an arrow function but is now
    // out of scope, return true. If a variable was never observed
    // in the params of an arrow function, return true. Otherwise,
    // return false.
    isScopedToExpression(node: t.Identifier): boolean {
        return !!this.variableShadowingCount.get(node.name);
    }
}

function collectParams(node: t.BaseNode, vars: VariableNames) {
    if (node.type === 'Identifier') {
        collectParamsFromIdentifier(node as t.Identifier, vars);
    } else if (node.type === 'ObjectPattern') {
        collectParamsFromObjectPattern(node as t.ObjectPattern, vars);
    } else if (node.type === 'Property') {
        collectParamsFromProperty(node as t.Property, vars);
    } else if (node.type === 'ArrayPattern') {
        collectParamsFromArrayPattern(node as t.ArrayPattern, vars);
    } else if (node.type === 'RestElement') {
        collectParamsFromRestElement(node as t.RestElement, vars);
    } else if (node.type === 'AssignmentPattern') {
        collectParamsFromAssignmentPattern(node as t.AssignmentPattern, vars);
    } else if (node.type === 'MemberExpression') {
        collectParamsFromMemberExpression(node as t.MemberExpression, vars);
    } else {
        throw new Error(`Cannot collect params from node type ${node.type}`);
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
    // eslint-disable-next-line
    // TODO: introduce new LWC error code
    throw new Error('Default parameters are not permitted in template expressions.');
}

function collectParamsFromMemberExpression(_node: t.MemberExpression, _vars: VariableNames) {
    // eslint-disable-next-line
    // TODO: introduce new LWC error code
    throw new Error('Unexpected member expression in arrow function parameter.');
}
