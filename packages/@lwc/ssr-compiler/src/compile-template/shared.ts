/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { normalizeStyleAttributeValue, normalizeTabIndex } from '@lwc/shared';
import { isValidES3Identifier } from '@babel/types';
import { produce } from 'immer';
import { esTemplateWithYield } from '../estemplate';
import { expressionIrToEs } from './expression';
import type { TransformerContext } from './types';
import type {
    Attribute as IrAttribute,
    Node as IrNode,
    Property as IrProperty,
} from '@lwc/template-compiler';
import type {
    Expression as EsExpression,
    ObjectExpression as EsObjectExpression,
    Property as EsProperty,
    Statement as EsStatement,
    IfStatement as EsIfStatement,
    YieldExpression as EsYieldExpression,
    ExpressionStatement as EsExpressionStatement,
} from 'estree';
import type {
    ComplexExpression as IrComplexExpression,
    Expression as IrExpression,
    Literal as IrLiteral,
} from '@lwc/template-compiler';

const bYieldTernary =
    esTemplateWithYield`yield ${is.expression} ? ${is.expression} : ${is.expression}`<EsExpressionStatement>;

interface OptimizableYield extends EsExpressionStatement {
    expression: EsYieldExpression & { delegate: false };
}

const bOptimizedYield = esTemplateWithYield`yield ${is.expression};`<OptimizableYield>;

function isOptimizableYield(stmt: EsStatement | undefined): stmt is OptimizableYield {
    return (
        is.expressionStatement(stmt) &&
        is.yieldExpression(stmt.expression) &&
        stmt.expression.delegate === false
    );
}

/** Returns null if the statement cannot be optimized. */
function optimizeSingleStatement(stmt: EsStatement): OptimizableYield | null {
    if (is.blockStatement(stmt)) {
        // `if (cond) { ... }` => optimize inner yields and see if we can condense
        const optimizedBlock = optimizeAdjacentYieldStmts(stmt.body);
        // More than one statement cannot be optimized into a single yield
        if (optimizedBlock.length !== 1) return null;
        const [optimized] = optimizedBlock;
        return isOptimizableYield(optimized) ? optimized : null;
    } else if (is.expressionStatement(stmt)) {
        // `if (cond) expression` => just check if expression is a yield
        return is.yieldExpression(stmt) ? stmt : null;
    } else {
        // Can only optimize expression/block statements
        return null;
    }
}

/**
 * Tries to reduce if statements that only contain yields into a single yielded ternary
 * Returns null if the statement cannot be optimized.
 */
function optimizeIfStatement(stmt: EsIfStatement): EsExpressionStatement | null {
    const consequent = optimizeSingleStatement(stmt.consequent)?.expression.argument;
    if (!consequent) {
        return null;
    }

    const alternate = stmt.alternate
        ? optimizeSingleStatement(stmt.alternate)?.expression.argument
        : b.literal('');
    if (!alternate) {
        return null;
    }

    return bYieldTernary(stmt.test, consequent, alternate);
}

export function optimizeAdjacentYieldStmts(statements: EsStatement[]): EsStatement[] {
    return statements.reduce((result: EsStatement[], stmt: EsStatement): EsStatement[] => {
        if (is.ifStatement(stmt)) {
            const optimized = optimizeIfStatement(stmt);
            if (optimized) {
                stmt = optimized;
            }
        }
        const prev = result.at(-1);
        if (!isOptimizableYield(stmt) || !isOptimizableYield(prev)) {
            // nothing to do
            return [...result, stmt];
        }
        const arg = stmt.expression.argument;
        if (!arg || (is.literal(arg) && arg.value === '')) {
            // bare `yield` and `yield ""` amount to nothing, so we can drop them
            return result;
        }
        const newArg = produce(prev.expression.argument!, (draft) => {
            if (is.literal(arg) && typeof arg.value === 'string') {
                let concatTail = draft;
                while (is.binaryExpression(concatTail) && concatTail.operator === '+') {
                    concatTail = concatTail.right;
                }
                if (is.literal(concatTail) && typeof concatTail.value === 'string') {
                    // conat adjacent strings now, rather than at runtime
                    concatTail.value += arg.value;
                    return draft;
                }
            }
            // concat arbitrary values at runtime
            return b.binaryExpression('+', draft, arg);
        });

        // replace the last `+` chain with a new one with the new arg
        return [...result.slice(0, -1), bOptimizedYield(newArg)];
    }, []);
}

export function bAttributeValue(node: IrNode, attrName: string): EsExpression {
    if (!('attributes' in node)) {
        throw new TypeError(`Cannot get attribute value from ${node.type}`);
    }
    const nameAttrValue = node.attributes.find((attr) => attr.name === attrName)?.value;
    if (!nameAttrValue) {
        return b.literal(null);
    } else if (nameAttrValue.type === 'Literal') {
        const name = typeof nameAttrValue.value === 'string' ? nameAttrValue.value : '';
        return b.literal(name);
    } else {
        return b.memberExpression(b.literal('instance'), nameAttrValue as EsExpression);
    }
}

export function normalizeClassAttributeValue(value: string) {
    return value.trim().replace(/\s+/g, ' ');
}

export function getChildAttrsOrProps(
    attrs: (IrAttribute | IrProperty)[],
    cxt: TransformerContext
): EsObjectExpression {
    const objectAttrsOrProps = attrs
        .map(({ name, value, type }) => {
            // Babel function required to align identifier validation with babel-plugin-component: https://github.com/salesforce/lwc/issues/4826
            const key = isValidES3Identifier(name) ? b.identifier(name) : b.literal(name);
            const nameLower = name.toLowerCase();

            if (value.type === 'Literal' && typeof value.value === 'string') {
                let literalValue: string | boolean = value.value;
                if (name === 'style') {
                    literalValue = normalizeStyleAttributeValue(literalValue);
                } else if (name === 'class') {
                    literalValue = normalizeClassAttributeValue(literalValue);
                    if (literalValue === '') {
                        return; // do not render empty `class=""`
                    }
                } else if (name === 'spellcheck') {
                    // `spellcheck` string values are specially handled to massage them into booleans:
                    // https://github.com/salesforce/lwc/blob/574ffbd/packages/%40lwc/template-compiler/src/codegen/index.ts#L445-L448
                    literalValue = literalValue.toLowerCase() !== 'false';
                } else if (nameLower === 'tabindex') {
                    // Global HTML "tabindex" attribute is specially massaged into a stringified number
                    // This follows the historical behavior in api.ts:
                    // https://github.com/salesforce/lwc/blob/f34a347/packages/%40lwc/engine-core/src/framework/api.ts#L193-L211

                    literalValue = normalizeTabIndex(literalValue);
                }
                return b.property('init', key, b.literal(literalValue));
            } else if (value.type === 'Literal' && typeof value.value === 'boolean') {
                if (name === 'class') {
                    return; // do not render empty `class=""`
                }
                return b.property('init', key, b.literal(type === 'Attribute' ? '' : value.value));
            } else if (value.type === 'Identifier' || value.type === 'MemberExpression') {
                let propValue = expressionIrToEs(value, cxt);
                if (name === 'class') {
                    cxt.import('normalizeClass');
                    propValue = b.callExpression(b.identifier('normalizeClass'), [propValue]);
                } else if (nameLower === 'tabindex') {
                    cxt.import('normalizeTabIndex');
                    propValue = b.callExpression(b.identifier('normalizeTabIndex'), [propValue]);
                }

                return b.property('init', key, propValue);
            }
            throw new Error(`Unimplemented child attr IR node type: ${value.type}`);
        })
        .filter(Boolean) as EsProperty[];

    return b.objectExpression(objectAttrsOrProps);
}

/**
 * Determine if the provided node is of type Literal
 * @param node
 */
export function isLiteral(node: IrLiteral | IrExpression | IrComplexExpression): node is IrLiteral {
    return node.type === 'Literal';
}
