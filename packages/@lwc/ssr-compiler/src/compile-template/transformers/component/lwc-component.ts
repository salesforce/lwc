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
        const childProps = ${/* child props */ is.objectExpression};
        const childAttrs = ${/* child attrs */ is.objectExpression};
        /* 
            If 'slotAttributeValue' is set, it references a slot that does not exist, and the 'slot' attribute should be set in the DOM. This behavior aligns with engine-server and engine-dom.
            See: engine-server/src/__tests__/fixtures/slot-forwarding/slots/dangling/ for example case.
        */
        if (slotAttributeValue) {
            childAttrs.slot = slotAttributeValue;
        }
        ${
            /*
                Slotted content is inserted here.
                Note that the slotted content will be stored in variables named 
                `shadowSlottedContent`/`lightSlottedContentMap / scopedSlottedContentMap` which are used below 
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
            scopedSlottedContentMap,
            instance,
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
