/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b } from 'estree-toolkit';
import { ElementDirective, IsDirective } from '@lwc/template-compiler';
import { expressionIrToEs } from './expression';

import { ImportedComponent } from './component';
import type { Component as IrComponent } from '@lwc/template-compiler';
import type { Transformer } from './types';

export function isLwcIsDirective(directive: ElementDirective): directive is IsDirective {
    return directive.name === 'Is';
}
export const LwcDynamic: Transformer<IrComponent> = function LwcDynamic(node, cxt) {
    const dynamicDirective = node.directives.find(isLwcIsDirective);
    if (!dynamicDirective) {
        throw new Error(`<lwc:component> must have an 'lwc:is' attribute.`);
    }
    const lwcClass = expressionIrToEs(dynamicDirective.value, cxt);
    const childGenerator = b.memberExpression(lwcClass, b.identifier('__LWC_GENERATE_MARKUP__'));
    const childTagname = b.memberExpression(lwcClass, b.identifier('__LWC_SEL__'));

    return [
        b.ifStatement(
            lwcClass,
            b.blockStatement(ImportedComponent(node, childGenerator, childTagname, cxt))
        ),
    ];
};
