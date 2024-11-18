/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { is } from 'estree-toolkit';
import { isUndefined } from '@lwc/shared';
import { Transformer } from '../types';
import { expressionIrToEs } from '../expression';
import { esTemplate, esTemplateWithYield } from '../../estemplate';
import { getChildAttrsOrProps } from '../shared';
import type {
    LwcComponent as IrLwcComponent,
    Expression as IrExpression,
} from '@lwc/template-compiler';
import type {
    IfStatement as EsIfStatement,
    VariableDeclaration as EsVariableDeclaration,
} from 'estree';

const bDynamicComponentConstructorDeclaration = esTemplate`
    const Ctor = '${/*lwcIs attribute value*/ is.expression}';
`<EsVariableDeclaration>;

const bYieldFromDynamicComponentConstructorGenerator = esTemplateWithYield`
    if (Ctor) {
        if (typeof Ctor !== 'function' || !(Ctor.prototype instanceof LightningElement)) {
            throw new Error(\`Invalid constructor: "\${String(Ctor)}" is not a LightningElement constructor.\`)
        }
        const childProps = __getReadOnlyProxy(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        yield* Ctor[SYMBOL__GENERATE_MARKUP](null, childProps, childAttrs);
    }
`<EsIfStatement>;

export const LwcComponent: Transformer<IrLwcComponent> = function LwcComponent(node, cxt) {
    const { directives } = node;

    const lwcIs = directives.find((directive) => directive.name === 'Is');
    if (!isUndefined(lwcIs)) {
        cxt.import({
            getReadOnlyProxy: '__getReadOnlyProxy',
            LightningElement: undefined,
            SYMBOL__GENERATE_MARKUP: undefined,
        });

        return [
            bDynamicComponentConstructorDeclaration(
                // The template compiler has validation to prevent lwcIs.value from being a literal
                expressionIrToEs(lwcIs.value as IrExpression, cxt)
            ),
            bYieldFromDynamicComponentConstructorGenerator(
                getChildAttrsOrProps(node.properties, cxt),
                getChildAttrsOrProps(node.attributes, cxt)
            ),
        ];
    } else {
        return [];
    }
};
