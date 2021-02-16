/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import estree from 'estree';
import { walk } from 'estree-walker';

import { TEMPLATE_PARAMS } from '../shared/constants';
import { isComponentProp } from '../shared/ir';
import { IRNode, TemplateExpression } from '../shared/types';
import {
    createIdentifier,
    createMemberExpression,
    isIdentifier,
    isMemberExpression,
} from '../shared/estree';

/**
 * Bind the passed expression to the component instance. It applies the following transformation to the expression:
 * - {value} --> {$cmp.value}
 * - {value[index]} --> {$cmp.value[$cmp.index]}
 */
export function bindExpression(expression: TemplateExpression, irNode: IRNode): TemplateExpression {
    const root: estree.BaseNode = expression as any;

    if (isIdentifier(root)) {
        if (isComponentProp(root as any, irNode)) {
            return createMemberExpression(createIdentifier(TEMPLATE_PARAMS.INSTANCE), root) as any;
        } else {
            return root as any;
        }
    }

    walk(root, {
        leave(node, parent) {
            if (
                parent !== null &&
                isIdentifier(node) &&
                isMemberExpression(parent) &&
                parent.object === node &&
                isComponentProp(node as any, irNode)
            ) {
                this.replace(
                    createMemberExpression(createIdentifier(TEMPLATE_PARAMS.INSTANCE), node)
                );
            }
        },
    });

    return root as any;
}
