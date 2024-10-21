/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';

import {
    HTML_NAMESPACE,
    isVoidElement,
    normalizeStyleAttribute,
    StringReplace,
    StringTrim,
} from '@lwc/shared';
import {
    type Attribute as IrAttribute,
    type Expression as IrExpression,
    type Element as IrElement,
    type Literal as IrLiteral,
    type Property as IrProperty,
    ExternalComponent as IrExternalComponent,
    Slot as IrSlot,
} from '@lwc/template-compiler';
import { esTemplate, esTemplateWithYield } from '../../estemplate';
import { expressionIrToEs } from '../expression';
import { irChildrenToEs } from '../ir-to-es';
import { bImportHtmlEscape, importHtmlEscapeKey } from '../shared';

import { Element } from './element';
import type {
    BinaryExpression,
    BlockStatement as EsBlockStatement,
    Expression as EsExpression,
    Statement as EsStatement,
    Literal as IrLiteral,
} from 'estree';
import type { Transformer } from './types';

const bYield = (expr: EsExpression) => b.expressionStatement(b.yieldExpression(expr));
const bConditionalLiveYield = esTemplateWithYield`
    {
        const prefix = (${/* isClass */ is.literal} && stylesheetScopeTokenClassPrefix) || '';
        const attrOrPropValue = ${is.expression};
        const valueType = typeof attrOrPropValue;
        if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
            yield ' ' + ${is.literal};
            if (valueType === 'string') {
                yield \`="\${prefix}\${htmlEscape(attrOrPropValue, true)}"\`;
            }
        }
    }
`<EsBlockStatement>;

const bStringLiteralYield = esTemplateWithYield`
    {
        const prefix = (${/* isClass */ is.literal} && stylesheetScopeTokenClassPrefix) || '';
        yield ' ' + ${is.literal} + '="' + prefix + "${is.literal}" + '"'
    }
`<EsBlockStatement>;

function yieldAttrOrPropLiteralValue(
    name: string,
    valueNode: IrLiteral,
    isClass: boolean
): EsStatement[] {
    const { value, type } = valueNode;
    if (typeof value === 'string') {
        let yieldedValue: string;
        if (name === 'style') {
            yieldedValue = normalizeStyleAttribute(value);
        } else if (name === 'class') {
            // @ts-expect-error weird indirection results in wrong overload being picked up
            yieldedValue = StringReplace.call(StringTrim.call(value), /\s+/g, ' ');
        } else {
            yieldedValue = value;
        }
        return [bStringLiteralYield(b.literal(isClass), b.literal(name), b.literal(yieldedValue))];
    } else if (typeof value === 'boolean') {
        return [bYield(b.literal(` ${name}`))];
    }
    throw new Error(`Unknown attr/prop literal: ${type}`);
}

function yieldAttrOrPropLiveValue(
    name: string,
    value: IrExpression | BinaryExpression,
    isClass: boolean
): EsStatement[] {
    const instanceMemberRef = b.memberExpression(b.identifier('instance'), value as EsExpression);
    return [bConditionalLiveYield(b.literal(isClass), instanceMemberRef, b.literal(name))];
}

function reorderAttributes(
    attrs: IrAttribute[],
    props: IrProperty[]
): (IrAttribute | IrProperty)[] {
    let classAttr: IrAttribute | null = null;
    let styleAttr: IrAttribute | null = null;
    let slotAttr: IrAttribute | null = null;

    const boringAttrs = attrs.filter((attr) => {
        if (attr.name === 'class') {
            classAttr = attr;
            return false;
        } else if (attr.name === 'style') {
            styleAttr = attr;
            return false;
        } else if (attr.name === 'slot') {
            slotAttr = attr;
            return false;
        }
        return true;
    });

    return [classAttr, styleAttr, ...boringAttrs, ...props, slotAttr].filter(
        (el): el is IrAttribute => el !== null
    );
}

const bConditionalSlot = esTemplate`
    if (isLightDom) {
        yield* slottedContent["${is.literal}"]
    } else {
        ${is.statement}
    }
`;

export const Slot: Transformer<IrSlot> = function Slot(node, ctx): EsStatement[] {
    const nameAttr = node.attributes.find((attr) => attr.name === 'name');
    if (nameAttr.type === 'Literal') {
        yieldAttrOrPropLiteralValue(name, value, isClass);
    } else {
        yieldAttrOrPropLiveValue(name, value, isClass);
    }

    return bConditionalSlot(b.literal(slotName ?? ''), Element(node, ctx));
};
