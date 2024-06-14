/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import { HTML_NAMESPACE, isVoidElement } from '@lwc/shared';
import { esTemplateWithYield } from '../estemplate';
import { irChildrenToEs } from './ir-to-es';
import { bImportHtmlEscape, importHtmlEscapeKey, cleanStyleAttrVal } from './shared';

import type {
    Attribute as IrAttribute,
    Expression as IrExpression,
    Element as IrElement,
    Literal as IrLiteral,
    Property as IrProperty,
} from '@lwc/template-compiler';
import type {
    BlockStatement as EsBlockStatement,
    Expression as EsExpression,
    Statement as EsStatement,
} from 'estree';
import type { Transformer } from './types';

const bYield = (expr: EsExpression) => b.expressionStatement(b.yieldExpression(expr));
const bConditionalLiveYield = esTemplateWithYield<EsBlockStatement>`
    {
        const attrOrPropValue = ${is.expression};
        const valueType = typeof attrOrPropValue;
        if (attrOrPropValue && (valueType === 'string' || valueType === 'boolean')) {
            yield ' ' + ${is.literal};
            if (valueType === 'string') {
                yield '="' + htmlEscape(attrOrPropValue, true) + '"';
            }
        }
    }
`;

function yieldAttrOrPropLiteralValue(name: string, valueNode: IrLiteral): EsStatement[] {
    const { value, type } = valueNode;
    if (typeof value === 'string') {
        const yieldedValue = name === 'style' ? cleanStyleAttrVal(value) : value;
        return [bYield(b.literal(` ${name}="${yieldedValue}"`))];
    } else if (typeof value === 'boolean') {
        return [bYield(b.literal(` ${name}`))];
    }
    throw new Error(`Unknown attr/prop literal: ${type}`);
}

function yieldAttrOrPropLiveValue(name: string, value: IrExpression): EsStatement[] {
    const instanceMemberRef = b.memberExpression(b.identifier('instance'), value as EsExpression);
    return [bConditionalLiveYield(instanceMemberRef, b.literal(name))];
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

export const Element: Transformer<IrElement> = function Element(node, cxt): EsStatement[] {
    const attrsAndProps: (IrAttribute | IrProperty)[] = reorderAttributes(
        node.attributes,
        node.properties
    );

    const yieldAttrsAndProps = attrsAndProps.flatMap((attr) => {
        cxt.hoist(bImportHtmlEscape(), importHtmlEscapeKey);
        if (attr.value.type === 'Literal') {
            return yieldAttrOrPropLiteralValue(attr.name, attr.value);
        } else {
            return yieldAttrOrPropLiveValue(attr.name, attr.value);
        }
    });

    if (isVoidElement(node.name, HTML_NAMESPACE)) {
        return [bYield(b.literal(`<${node.name}`)), ...yieldAttrsAndProps, bYield(b.literal(`>`))];
    }

    return [
        bYield(b.literal(`<${node.name}`)),
        ...yieldAttrsAndProps,
        bYield(b.literal(`>`)),
        ...irChildrenToEs(node.children, cxt),
        bYield(b.literal(`</${node.name}>`)),
    ].filter(Boolean);
};
