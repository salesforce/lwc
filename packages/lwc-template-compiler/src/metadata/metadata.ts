import {
    IRAttributeType,
    IRElement,
    TemplateDependencyMetadata,
    TemplateDependencyParameter,
    TemplateDependencyParameterType,
    TemplateDependencyParameterValue,
    TemplateExpression,
    TemplateIdentifier
} from "../shared/types";
import {kebabcaseToCamelcase} from "../shared/naming";
import * as babelTypes from 'babel-types';

export function getCustomElementMetadata(element: IRElement): TemplateDependencyMetadata {
    const parameters = {};
    if (element.props) {
        for (const [name, value] of Object.entries(element.props)) {
            let returnedType: TemplateDependencyParameterType;
            let returnedValue: TemplateDependencyParameterValue;

            if (value.type === IRAttributeType.Expression) {
                returnedType = 'expression';
                const expression = value.value as TemplateExpression;
                if (babelTypes.isMemberExpression(expression)) {
                    returnedValue = buildRawExpression(expression);
                } else {
                    returnedValue = (expression as TemplateIdentifier).name;
                }
            } else {
                returnedType = 'literal';
                returnedValue = value.value;
            }
            parameters[name] = {
                type: returnedType,
                value: returnedValue
            } as TemplateDependencyParameter;
        }
    }
    return {
        nodeType: 'component',
        tagName: kebabcaseToCamelcase(element.tag),
        parameters,
    } as TemplateDependencyMetadata;
}

function buildRawExpression(expression: babelTypes.MemberExpression): string {
    const result: String[] = [];
    let current: babelTypes.Expression = expression;
    while (babelTypes.isMemberExpression(current)) {
        const property = (current as babelTypes.MemberExpression).property;
        result.push((property as TemplateIdentifier).name);
        current = current.object;
    }
    result.push((current as TemplateIdentifier).name);
    return result.reverse().join('.');
}
