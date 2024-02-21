/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Program } from 'estree';
import { builders as b } from 'estree-toolkit';
import { ComponentMetaState } from './types';

/**
 * This function adds the tagname
 * e.g. Test.__LWC_SEL__ = 'x-test'
 */
export function addSelector(
    program: Program,
    state: ComponentMetaState,
    name: string,
    namespace: string
) {
    const { isLWC, lwcClassName } = state;
    if (!isLWC) return;
    const classIdentifier = b.identifier(lwcClassName!);

    const kebabCasedName = name?.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const selector = namespace && kebabCasedName ? `${namespace}-${kebabCasedName}` : '';
    program.body.push(
        b.expressionStatement(
            b.assignmentExpression(
                '=',
                b.memberExpression(classIdentifier, b.identifier('__LWC_SEL__')),
                b.literal(selector)
            )
        )
    );
}
