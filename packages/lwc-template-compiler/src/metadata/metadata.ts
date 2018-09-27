import {
    IRAttributeType,
    IRElement,
    DependencyMetadata,
    TemplateExpression,
    TemplateIdentifier
} from "../shared/types";
import { kebabcaseToCamelcase } from "../shared/naming";
import generate from 'babel-generator';
import * as babelTypes from 'babel-types';

export function getModuleMetadata(element: IRElement): DependencyMetadata {
    let properties;
    // Note that we only collect properties and not attributes (such as 'class', 'id', etc.)
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
                value: returnedValue
            };
        }
    }
    return {
        moduleName: kebabcaseToCamelcase(element.tag),
        properties,
    };
}
