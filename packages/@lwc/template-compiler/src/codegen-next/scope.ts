/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { walk } from 'estree-walker';

import * as t from '../shared/estree';
import { TEMPLATE_PARAMS } from '../shared/constants';
import { Expression, Literal } from '../shared-next/types';

export default class Scope {
    private readonly scopes: t.Identifier[][] = [];

    beginScope() {
        this.scopes.push([]);
    }

    endScope() {
        this.scopes.pop();
    }

    peek() {
        return this.scopes[this.scopes.length - 1];
    }

    declare(identifier: t.Identifier) {
        this.peek().push(identifier);
    }

    resolve(identifier: t.Identifier) {
        for (const id of this.scopes.flat()) {
            if (identifier.name === id.name) {
                return false;
            }
        }

        return true;
    }

    /**
     * Bind the passed expression to the component instance. It applies the following transformation to the expression:
     * - {value} --> {$cmp.value}
     * - {value[index]} --> {$cmp.value[$cmp.index]}
     */
    bindExpression(expression: Expression | Literal): t.Expression {
        if (t.isIdentifier(expression)) {
            if (this.resolve(expression)) {
                return t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), expression);
            } else {
                return expression;
            }
        }

        const scope = this;
        walk(expression, {
            leave(node, parent) {
                if (
                    parent !== null &&
                    t.isIdentifier(node) &&
                    t.isMemberExpression(parent) &&
                    parent.object === node &&
                    scope.resolve(node)
                ) {
                    this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
                }
            },
        });

        return expression as t.Expression;
    }
}
