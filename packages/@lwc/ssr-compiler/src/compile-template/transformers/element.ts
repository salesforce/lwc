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
import { esTemplateWithYield } from '../../estemplate';
import { expressionIrToEs } from '../expression';
import { irChildrenToEs } from '../ir-to-es';
import { bImportHtmlEscape, getScopedExpression, importHtmlEscapeKey } from '../shared';

import { bImportDeclaration } from '../../estree/builders';
import type {
    BinaryExpression,
    BlockStatement as EsBlockStatement,
    Expression as EsExpression,
    Statement as EsStatement,
} from 'estree';
import type { Transformer, TransformerContext } from '../types';

const bYield = (expr: EsExpression) => b.expressionStatement(b.yieldExpression(expr));

// TODO [#4714]: scope token renders as a suffix for literals, but prefix for expressions
const bConditionalLiveYield = esTemplateWithYield`
    {
        const shouldRenderScopeToken = ${/* isClass */ is.literal} &&
            (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
        const prefix = shouldRenderScopeToken ? stylesheetScopeToken + ' ' : '';

        const attrValue = ${/* attribute value expression */ is.expression};
        const valueType = typeof attrValue;

        if (attrValue && (valueType === 'string' || valueType === 'boolean')) {
            yield ' ' + ${/* attribute name */ is.literal};
            if (valueType === 'string') {
                yield \`="\${prefix}\${htmlEscape(attrValue, true)}"\`;
            }
        }
    }
`<EsBlockStatement>;

// TODO [#4714]: scope token renders as a suffix for literals, but prefix for expressions
const bStringLiteralYield = esTemplateWithYield`
    {
        const shouldRenderScopeToken = ${/* isClass */ is.literal} &&
            (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
        const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';
        yield ' ' + ${/* attribute name */ is.literal} + '="' + "${/* attribute value */ is.literal}" + suffix + '"'
    }
`<EsBlockStatement>;

const bConditionallyYieldScopeTokenClass = esTemplateWithYield`
    {
        const shouldRenderScopeToken = hasScopedStylesheets || hasScopedStaticStylesheets(Cmp);
        if (shouldRenderScopeToken) {
            yield \` class="\${stylesheetScopeToken}"\`;
        }
    }
`<EsBlockStatement>;

const bYieldSanitizedHtml = esTemplateWithYield`
    yield sanitizeHtmlContent(${/* lwc:inner-html content */ is.expression})
`;

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
    isClass: boolean,
    cxt: TransformerContext
): EsStatement[] {
    const scopedExpression = getScopedExpression(value as EsExpression, cxt);
    return [bConditionalLiveYield(b.literal(isClass), scopedExpression, b.literal(name))];
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

        let isClass = false;
        if (type === 'Attribute') {
            if (name === 'inner-h-t-m-l' || name === 'outer-h-t-m-l') {
                throw new Error(`Cannot set attribute "${name}" on <${node.name}>.`);
            } else if (name === 'class') {
                isClass = true;
                hasClassAttribute = true;
            }
        }

        cxt.hoist(bImportHtmlEscape(), importHtmlEscapeKey);
        if (value.type === 'Literal') {
            return yieldAttrOrPropLiteralValue(name, value, isClass);
        } else {
            return yieldAttrOrPropLiveValue(name, value, isClass, cxt);
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
        childContent = [bYieldSanitizedHtml(unsanitizedHtmlExpression)];
        cxt.hoist(bImportDeclaration(['sanitizeHtmlContent']), 'import:sanitizeHtmlContent');
    } else {
        childContent = [];
    }

    return [
        bYield(b.literal(`<${node.name}`)),
        // If we haven't already prefixed the scope token to an existing class, add an explicit class here
        ...(hasClassAttribute ? [] : [bConditionallyYieldScopeTokenClass()]),
        ...yieldAttrsAndProps,
        bYield(b.literal(`>`)),
        ...childContent,
        bYield(b.literal(`</${node.name}>`)),
    ].filter(Boolean);
};
