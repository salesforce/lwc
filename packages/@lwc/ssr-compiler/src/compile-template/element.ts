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
import { esTemplateWithYield } from '../estemplate';
import { expressionIrToEs } from './expression';
import { irChildrenToEs } from './ir-to-es';
import { bImportHtmlEscape, importHtmlEscapeKey } from './shared';

import type {
    BinaryExpression,
    BlockStatement as EsBlockStatement,
    Expression as EsExpression,
    Statement as EsStatement,
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

export const Element: Transformer<IrElement | IrExternalComponent | IrSlot> = function Element(
    node,
    cxt
): EsStatement[] {
    const innerHtmlDirective =
        node.type === 'Element' && node.directives.find((dir) => dir.name === 'InnerHTML');

    const attrsAndProps: (IrAttribute | IrProperty)[] = reorderAttributes(
        node.attributes,
        node.properties
    );

    let hasClassAttribute = false;
    const yieldAttrsAndProps = attrsAndProps.flatMap((attr) => {
        const { name, value, type } = attr;

        // For classes, these may need to be prefixed with the scope token
        const isClass = type === 'Attribute' && name === 'class';
        if (isClass) {
            hasClassAttribute = true;
        }

        cxt.hoist(bImportHtmlEscape(), importHtmlEscapeKey);
        if (value.type === 'Literal') {
            return yieldAttrOrPropLiteralValue(name, value, isClass);
        } else {
            return yieldAttrOrPropLiveValue(name, value, isClass);
        }
    });

    if (isVoidElement(node.name, HTML_NAMESPACE)) {
        return [bYield(b.literal(`<${node.name}`)), ...yieldAttrsAndProps, bYield(b.literal(`>`))];
    }

    let childContent: EsStatement[];
    // An element can have children or lwc:inner-html, but not both
    // If it has both, the template compiler will throw an error before reaching here
    if (node.children.length) {
        childContent = irChildrenToEs(node.children, cxt);
    } else if (innerHtmlDirective) {
        const value = innerHtmlDirective.value;
        const unsanitizedHtmlExpression =
            value.type === 'Literal' ? b.literal(value.value) : expressionIrToEs(value, cxt);
        childContent = [bYield(unsanitizedHtmlExpression)];
    } else {
        childContent = [];
    }

    return [
        bYield(b.literal(`<${node.name}`)),
        // If we haven't already prefixed the scope token to an existing class, add an explicit class here
        ...(hasClassAttribute ? [] : [bYield(b.identifier('stylesheetScopeTokenClass'))]),
        ...yieldAttrsAndProps,
        bYield(b.literal(`>`)),
        ...childContent,
        bYield(b.literal(`</${node.name}>`)),
    ].filter(Boolean);
};
