/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { is } from 'estree-toolkit';
import { isUndefined } from '@lwc/shared';
import { expressionIrToEs } from '../../expression';
import { esTemplateWithYield } from '../../../estemplate';
import { getChildAttrsOrProps } from '../../shared';
import { getSlottedContent } from './slotted-content';
import type { Transformer } from '../../types';
import type {
    LwcComponent as IrLwcComponent,
    Expression as IrExpression,
} from '@lwc/template-compiler';
import type { Statement as EsStatement } from 'estree';

const bYieldFromDynamicComponentConstructorGenerator = esTemplateWithYield`
    const Ctor = '${/* lwcIs attribute value */ is.expression}';
    if (Ctor) {
        if (typeof Ctor !== 'function' || !(Ctor.prototype instanceof LightningElement)) {
            throw new Error(\`Invalid constructor: "\${String(Ctor)}" is not a LightningElement constructor.\`)
        }
        const childProps = __getReadOnlyProxy(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        ${
            /*
                Slotted content is inserted here.
                Note that the slotted content will be stored in variables named 
                `shadowSlottedContent`/`lightSlottedContentMap` which are used below 
                when the child's generateMarkup function is invoked.
            */
            is.statement
        }

        const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;

        yield* Ctor[__SYMBOL__GENERATE_MARKUP](
            null, 
            childProps,
            childAttrs,
            shadowSlottedContent,
            lightSlottedContentMap,
            scopeToken,
            contextfulParent
        );
    }
`<EsStatement[]>;

export const LwcComponent: Transformer<IrLwcComponent> = function LwcComponent(node, cxt) {
    const { directives } = node;

    const lwcIs = directives.find((directive) => directive.name === 'Is');
    if (!isUndefined(lwcIs)) {
        cxt.import({
            getReadOnlyProxy: '__getReadOnlyProxy',
            LightningElement: undefined,
            SYMBOL__GENERATE_MARKUP: '__SYMBOL__GENERATE_MARKUP',
        });

        return bYieldFromDynamicComponentConstructorGenerator(
            // The template compiler has validation to prevent lwcIs.value from being a literal
            expressionIrToEs(lwcIs.value as IrExpression, cxt),
            getChildAttrsOrProps(node.properties, cxt),
            getChildAttrsOrProps(node.attributes, cxt),
            getSlottedContent(node, cxt)
        );
    } else {
        return [];
    }
};
