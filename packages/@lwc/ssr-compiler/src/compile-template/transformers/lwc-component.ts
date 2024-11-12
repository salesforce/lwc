/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { builders as b, is } from 'estree-toolkit';
import { isUndefined, normalizeStyleAttribute } from '@lwc/shared';
import { Transformer, TransformerContext } from '../types';
import { expressionIrToEs } from '../expression';
import { esTemplateWithYield } from '../../estemplate';
import { bImportDeclaration } from '../../estree/builders';
import { isValidIdentifier } from '../shared';
import type {
    LwcComponent as IrLwcComponent,
    Expression as IrExpression,
    Attribute as IrAttribute,
    Property as IrProperty,
} from '@lwc/template-compiler';
import type {
    BlockStatement as EsBlockStatement,
    ObjectExpression as EsObjectExpression,
} from 'estree';

// FIXME: this might not be needed
function getChildAttrsOrProps(
    attrs: (IrAttribute | IrProperty)[],
    cxt: TransformerContext
): EsObjectExpression {
    const objectAttrsOrProps = attrs.map((attr) => {
        const key = isValidIdentifier(attr.name) ? b.identifier(attr.name) : b.literal(attr.name);
        if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
            const value =
                attr.name === 'style'
                    ? normalizeStyleAttribute(attr.value.value)
                    : attr.value.value;
            return b.property('init', key, b.literal(value));
        } else if (attr.value.type === 'Literal' && typeof attr.value.value === 'boolean') {
            return b.property(
                'init',
                key,
                b.literal(attr.type === 'Attribute' ? '' : attr.value.value)
            );
        } else if (attr.value.type === 'Identifier' || attr.value.type === 'MemberExpression') {
            const propValue = expressionIrToEs(attr.value, cxt);
            return b.property('init', key, propValue);
        }
        throw new Error(`Unimplemented child attr IR node type: ${attr.value.type}`);
    });

    return b.objectExpression(objectAttrsOrProps);
}

// FIXME: this should be the LightningElement's tagName and should be passing props to the element
// The tagName is part of the component export and not available on the LightningElement for dynamic components
// Need a way to parse the tagName and either attach it to the constructor or reimport the tagName when the constructor is ready
// Or just put in on the generateMarkup function itself
const bYieldFromDynamicComponentConstructor = esTemplateWithYield`
    {
        const childProps = __cloneAndDeepFreeze(${/* child props */ is.objectExpression});
        const childAttrs = ${/* child attrs */ is.objectExpression};
        const ctor = ${is.expression};
        yield* ctor[SYMBOL__GENERATE_MARKUP]('x-test', childProps, childAttrs);
    }
`<EsBlockStatement>;

export const LwcComponent: Transformer<IrLwcComponent> = function LwcComponent(node, cxt) {
    const { directives } = node;
    const lwcIs = directives.find((directive) => directive.name === 'Is');

    cxt.hoist(bImportDeclaration(['LightningElement']), 'import:LightningElement');
    cxt.hoist(bImportDeclaration(['SYMBOL__GENERATE_MARKUP']), 'import:SYMBOL__GENERATE_MARKUP');
    cxt.hoist(
        bImportDeclaration([{ cloneAndDeepFreeze: '__cloneAndDeepFreeze' }]),
        'import:cloneAndDeepFreeze'
    );

    // FIXME: add validation to detect if it's a valid constructor being passed
    if (!isUndefined(lwcIs)) {
        const lwcIsExpression = expressionIrToEs(lwcIs.value as IrExpression, cxt);
        // const comparison = b.binaryExpression(
        //     'instanceof',
        //     lwcIsExpression,
        //     b.identifier('LightningElement')
        // );

        // return [
        //     // b.ifStatement(
        //     //     comparison,
        //     //     bYieldFromDynamicComponentConstructor(lwcIsExpression)
        //     // )
        //     bYieldFromDynamicComponentConstructor(lwcIsExpression)
        // ]
        return [
            b.ifStatement(
                lwcIsExpression,
                bYieldFromDynamicComponentConstructor(
                    getChildAttrsOrProps(node.properties, cxt),
                    getChildAttrsOrProps(node.attributes, cxt),
                    lwcIsExpression
                )
            ),
        ];
    }

    return [];
};
