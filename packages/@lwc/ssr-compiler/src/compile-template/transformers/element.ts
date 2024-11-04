/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { builders as b, is } from 'estree-toolkit';
import {
    HTML_NAMESPACE,
    isBooleanAttribute,
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
        const attrName = ${/* attribute name */ is.literal};
        let attrValue = ${/* attribute value expression */ is.expression};
        const isHtmlBooleanAttr = ${/* isHtmlBooleanAttr */ is.literal};

        const shouldRenderScopeToken = attrName === 'class' &&
            (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
        const prefix = shouldRenderScopeToken ? stylesheetScopeToken + ' ' : '';

        // Global HTML boolean attributes are specially coerced into booleans
        // https://github.com/salesforce/lwc/blob/f34a347/packages/%40lwc/template-compiler/src/codegen/index.ts#L450-L454
        if (isHtmlBooleanAttr) {
            attrValue = attrValue ? '' : undefined;
        }

        // Global HTML "tabindex" attribute is specially massaged into a stringified number
        // This follows the historical behavior in api.ts:
        // https://github.com/salesforce/lwc/blob/f34a347/packages/%40lwc/engine-core/src/framework/api.ts#L193-L211
        if (attrName === 'tabindex') {
            const shouldNormalize = attrValue > 0 && !(attrValue === true || attrValue === false);
            attrValue = shouldNormalize ? 0 : attrValue;
        }

        if (attrValue !== undefined && attrValue !== null) {
            yield ' ' + attrName;
            if (attrValue !== '') {
                yield \`="\${prefix}\${htmlEscape(String(attrValue), true)}"\`;
            }
        }
    }
`<EsBlockStatement>;

// TODO [#4714]: scope token renders as a suffix for literals, but prefix for expressions
const bStringLiteralYield = esTemplateWithYield`
    {
        const attrName = ${/* attribute name */ is.literal}
        const attrValue = ${/* attribute value */ is.literal};

        const shouldRenderScopeToken = attrName === 'class' &&
            (hasScopedStylesheets || hasScopedStaticStylesheets(Cmp));
        const suffix = shouldRenderScopeToken ? ' ' + stylesheetScopeToken : '';

        yield ' ' + attrName;
        if (attrValue !== '' || shouldRenderScopeToken) {
            yield '="' + attrValue + suffix + '"';
        }
        
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

function yieldAttrOrPropLiteralValue(name: string, valueNode: IrLiteral): EsStatement[] {
    const { value, type } = valueNode;
    if (typeof value === 'string') {
        let yieldedValue: string;
        if (name === 'style') {
            yieldedValue = normalizeStyleAttribute(value);
        } else if (name === 'class') {
            // @ts-expect-error weird indirection results in wrong overload being picked up
            yieldedValue = StringReplace.call(StringTrim.call(value), /\s+/g, ' ');
        } else if (name === 'spellcheck') {
            // `spellcheck` string values are specially handled to massage them into booleans.
            yieldedValue = String(value.toLowerCase() !== 'false');
        } else {
            yieldedValue = value;
        }
        return [bStringLiteralYield(b.literal(name), b.literal(yieldedValue))];
    } else if (typeof value === 'boolean') {
        return [bYield(b.literal(` ${name}`))];
    }
    throw new Error(`Unknown attr/prop literal: ${type}`);
}

function yieldAttrOrPropLiveValue(
    elementName: string,
    name: string,
    value: IrExpression | BinaryExpression,
    cxt: TransformerContext
): EsStatement[] {
    const isHtmlBooleanAttr = isBooleanAttribute(name, elementName);
    const scopedExpression = getScopedExpression(value as EsExpression, cxt);

    return [bConditionalLiveYield(b.literal(name), scopedExpression, b.literal(isHtmlBooleanAttr))];
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
    const yieldAttrsAndProps = attrsAndProps
        .filter(({ name }) => {
            // `<input checked>`/`<input value>` is treated as a property, not an attribute,
            // so should never be SSR'd. See https://github.com/salesforce/lwc/issues/4763
            return !(node.name === 'input' && (name === 'value' || name === 'checked'));
        })
        .flatMap((attr) => {
            const { name, value, type } = attr;

            if (type === 'Attribute') {
                if (name === 'inner-h-t-m-l' || name === 'outer-h-t-m-l') {
                    throw new Error(`Cannot set attribute "${name}" on <${node.name}>.`);
                } else if (name === 'class') {
                    hasClassAttribute = true;
                }
            }

            cxt.hoist(bImportHtmlEscape(), importHtmlEscapeKey);
            if (value.type === 'Literal') {
                return yieldAttrOrPropLiteralValue(name, value);
            } else {
                return yieldAttrOrPropLiveValue(node.name, name, value, cxt);
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
