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

/**
 * Bind the passed expression to the component instance. It applies the following transformation to the expression:
 * - {value} --> {$cmp.value}
 * - {value[index]} --> {$cmp.value[$cmp.index]}
 */
export function bindExpression(expression: TemplateExpression, irNode: IRNode): t.Expression {
    const root: t.Expression = expression as any;

    if (t.isIdentifier(root)) {
        if (isComponentProp(root as any, irNode)) {
            return t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), root);
        } else {
            return root;
        }
    }

    walk(root, {
        leave(node, parent) {
            if (
                parent !== null &&
                t.isIdentifier(node) &&
                t.isMemberExpression(parent) &&
                parent.object === node &&
                isComponentProp(node as any, irNode)
            ) {
                this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
            }
        },
    });

    return root;
}
