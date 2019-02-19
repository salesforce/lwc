/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    IRAttributeType,
    IRElement,
    ModuleDependency,
    TemplateExpression,
    TemplateIdentifier,
} from '../shared/types';
import { kebabcaseToCamelcase } from '../shared/naming';
import generate from '@babel/generator';
import * as babelTypes from '@babel/types';

export function getModuleMetadata(element: IRElement): ModuleDependency {
    let properties;
    // Note that we only collect properties and not attributes (such as 'class', 'data-*')
    if (element.props) {
        properties = {};
        for (const [name, value] of Object.entries(element.props)) {
            let returnedType;
            let returnedValue;

            if (value.type === IRAttributeType.Expression) {
                returnedType = 'expression';
                const expression = value.value as TemplateExpression;
                if (babelTypes.isMemberExpression(expression)) {
                    returnedValue = generate(expression).code;
                } else {
                    returnedValue = (expression as TemplateIdentifier).name;
                }
            } else {
                returnedType = 'literal';
                returnedValue = value.value;
            }
            properties[name] = {
                type: returnedType,
                value: returnedValue,
            };
        }
    }

    return {
        moduleName: kebabcaseToCamelcase(element.component),
        tagName: element.tag,
        properties,
    };
}
