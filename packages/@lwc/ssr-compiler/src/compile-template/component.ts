/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { kebabcaseToCamelcase, toPropertyName } from '@lwc/template-compiler';
import { esTemplateWithYield } from '../estemplate';
import { cleanStyleAttrVal, isValidIdentifier } from './shared';
import { TransformerContext } from './types';
import { expressionIrToEs } from './expression';

import type {
    BlockStatement as EsBlockStatement,
    ObjectExpression as EsObjectExpression,
} from 'estree';
import type {
    Attribute as IrAttribute,
    Component as IrComponent,
    Property as IrProperty,
} from '@lwc/template-compiler';
import type { Transformer } from './types';

const bYieldFromChildGenerator = esTemplateWithYield<EsBlockStatement>`
    {
        const childProps = ${is.objectExpression};
        const childAttrs = ${is.objectExpression};
        const childSlottedContentGenerators = {};
        yield* ${is.identifier}(${is.literal}, childProps, childAttrs, childSlottedContentGenerators);
    }
`;

const bImportGenerateMarkup = (localName: string, importPath: string) =>
    b.importDeclaration(
        [b.importSpecifier(b.identifier('generateMarkup'), b.identifier(localName))],
        b.literal(importPath)
    );

function getChildAttrsOrProps(
    attrs: (IrAttribute | IrProperty)[],
    cxt: TransformerContext
): EsObjectExpression {
    const objectAttrsOrProps = attrs.map((attr) => {
        const key = isValidIdentifier(attr.name) ? b.identifier(attr.name) : b.literal(attr.name);
        if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
            const value =
                attr.name === 'style' ? cleanStyleAttrVal(attr.value.value) : attr.value.value;
            return b.property('init', key, b.literal(value));
        } else if (attr.value.type === 'Literal' && typeof attr.value.value === 'boolean') {
            return b.property('init', key, b.literal(attr.value.value));
        } else if (attr.value.type === 'Identifier' || attr.value.type === 'MemberExpression') {
            const propValue = expressionIrToEs(attr.value, cxt);
            return b.property('init', key, propValue);
        }
        throw new Error(`Unimplemented child attr IR node type: ${attr.value.type}`);
    });

    return b.objectExpression(objectAttrsOrProps);
}

function reflectAriaPropsAsAttrs(props: IrProperty[]): IrAttribute[] {
    return props
        .map((prop) => {
            if (prop.attributeName.startsWith('aria-') || prop.attributeName === 'role') {
                return {
                    type: 'Attribute',
                    name: prop.attributeName,
                    value: prop.value,
                } as IrAttribute;
            }
            return null;
        })
        .filter((el): el is NonNullable<IrAttribute> => el !== null);
}

export const Component: Transformer<IrComponent> = function Component(node, cxt) {
    // Import the custom component's generateMarkup export.
    const childGeneratorLocalName = `generateMarkup_${toPropertyName(node.name)}`;
    const importPath = kebabcaseToCamelcase(node.name);
    const componentImport = bImportGenerateMarkup(childGeneratorLocalName, importPath);
    cxt.hoist(componentImport, childGeneratorLocalName);
    const childTagName = node.name;

    const attributes = [...node.attributes, ...reflectAriaPropsAsAttrs(node.properties)];

    return [
        bYieldFromChildGenerator(
            getChildAttrsOrProps(node.properties, cxt),
            getChildAttrsOrProps(attributes, cxt),
            b.identifier(childGeneratorLocalName),
            b.literal(childTagName)
        ),
    ];
};
