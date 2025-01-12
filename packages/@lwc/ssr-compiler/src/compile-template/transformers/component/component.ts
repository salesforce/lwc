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
        const childProps = __getReadOnlyProxy(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        ${
            /*
                Slotted content is inserted here.
                Note that the slotted content will be stored in variables named 
                `shadowSlottedContent`/`lightSlottedContentMap` which are used below 
                when the child's generateMarkup function is invoked.
            */
            [is.statement]
        }

        const scopeToken = hasScopedStylesheets ? stylesheetScopeToken : undefined;
        const Ctor = ${/* Component */ is.identifier};

        yield* Ctor[__SYMBOL__GENERATE_MARKUP](
            ${/* tag name */ is.literal}, 
            childProps, 
            childAttrs, 
            shadowSlottedContent,
            lightSlottedContentMap,
            instance,
            scopeToken,
            contextfulParent
        );
    }
`<EsBlockStatement>;

export const Component: Transformer<IrComponent> = function Component(node, cxt) {
    // Import the custom component's generateMarkup export.
    const childComponentLocalName = `ChildComponentCtor_${toPropertyName(node.name)}`;
    const importPath = kebabcaseToCamelcase(node.name);
    cxt.import({ default: childComponentLocalName }, importPath);
    cxt.import({
        getReadOnlyProxy: '__getReadOnlyProxy',
        SYMBOL__GENERATE_MARKUP: '__SYMBOL__GENERATE_MARKUP',
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
