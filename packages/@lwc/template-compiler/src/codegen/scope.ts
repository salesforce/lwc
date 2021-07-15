/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { walk } from 'estree-walker';

import * as t from '../shared/estree';
import { TEMPLATE_PARAMS } from '../shared/constants';
import { isComponentProp } from '../shared/ir';
import { IRNode, TemplateExpression } from '../shared/types';

function dumpScope(scope: Scope, body: t.Statement[]) {
    for (const childScope of scope.childScopes) {
        body.unshift(childScope.scopeFn!);
        dumpScope(childScope, childScope.scopeFn?.body!.body!);
    }
}

export class Scope {
    id: number;
    parentScope: Scope | null = null;
    childScopes: Scope[] = [];
    scopeFn: t.FunctionDeclaration | null = null;

    constructor(id: number) {
        this.id = id;
    }

    setFn(
        params: t.FunctionExpression['params'],
        body: t.FunctionExpression['body'],
        kind: string
    ) {
        const id = t.identifier(`${kind}${this.id}_${this.childScopes.length}`);

        this.scopeFn = t.functionDeclaration(id, params, body);

        return id;
    }

    serializeInto(body: t.Statement[]) {
        dumpScope(this, body);
    }
}

/**
 * Bind the passed expression to the component instance. It applies the following transformation to the expression:
 * - {value} --> {$cmp.value}
 * - {value[index]} --> {$cmp.value[$cmp.index]}
 */
export function bindExpression(expression: TemplateExpression, irNode: IRNode): t.Expression {
    if (t.isIdentifier(expression)) {
        if (isComponentProp(expression, irNode)) {
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
                isComponentProp(node, irNode)
            ) {
                this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
            }
        },
    });

    return expression;
}
