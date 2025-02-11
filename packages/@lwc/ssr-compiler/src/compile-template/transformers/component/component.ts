/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { kebabcaseToCamelcase, toPropertyName } from '@lwc/template-compiler';
import { getChildAttrsOrProps } from '../../shared';
import { esTemplateWithYield } from '../../../estemplate';
import { getSlottedContent } from './slotted-content';

import type { BlockStatement as EsBlockStatement } from 'estree';
import type { Component as IrComponent } from '@lwc/template-compiler';
import type { Transformer } from '../../types';

const bYieldFromChildGenerator = esTemplateWithYield`
    {
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
        const generateMarkup = ${/* Component */ is.identifier}[__SYMBOL__GENERATE_MARKUP];
        const tagName = ${/* tag name */ is.literal};

        if (generateMarkup) {
            yield* generateMarkup(
                tagName, 
                childProps, 
                childAttrs, 
                shadowSlottedContent,
                lightSlottedContentMap,
                scopedSlottedContentMap,
                instance,
                scopeToken,
                contextfulParent
            );
        } else {
            yield \`<\${tagName}>\`;
            yield* __fallbackTmpl(shadowSlottedContent, lightSlottedContentMap, scopedSlottedContentMap, ${/* Component */ 3}, instance)
            yield \`</\${tagName}>\`;
        }
    }
`<EsBlockStatement>;

export const Component: Transformer<IrComponent> = function Component(node, cxt) {
    // Import the custom component's generateMarkup export.
    const childComponentLocalName = `ChildComponentCtor_${toPropertyName(node.name)}`;
    const importPath = kebabcaseToCamelcase(node.name);
    cxt.import({ default: childComponentLocalName }, importPath);
    cxt.import({
        SYMBOL__GENERATE_MARKUP: '__SYMBOL__GENERATE_MARKUP',
        fallbackTmpl: '__fallbackTmpl',
    });
    const childTagName = node.name;

    return [
        bYieldFromChildGenerator(
            getChildAttrsOrProps(node.properties, cxt),
            getChildAttrsOrProps(node.attributes, cxt),
            getSlottedContent(node, cxt),
            b.identifier(childComponentLocalName),
            b.literal(childTagName)
        ),
    ];
};
