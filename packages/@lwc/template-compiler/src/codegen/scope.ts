/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { walk } from 'estree-walker';

import * as t from '../shared/estree';
import { TEMPLATE_PARAMS } from '../shared/constants';
import { Expression, Literal } from '../shared/types';
import CodeGen from './codegen';

/**
 * Bind the passed expression to the component instance. It applies the following transformation to the expression:
 * - {value} --> {$cmp.value}
 * - {value[index]} --> {$cmp.value[$cmp.index]}
 */
export function bindExpression(expression: Expression | Literal, codegen: CodeGen): t.Expression {
    if (t.isIdentifier(expression)) {
        if (codegen.resolve(expression)) {
            return t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), expression);
        } else {
            return expression;
        }
    }

    walk(expression, {
        leave(node, parent) {
            if (
                parent !== null &&
                t.isIdentifier(node) &&
                t.isMemberExpression(parent) &&
                parent.object === node &&
                codegen.resolve(node)
            ) {
                this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
            }
        },
    });

    return expression as t.Expression;
}
