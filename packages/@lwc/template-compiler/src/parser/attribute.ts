/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { ParserDiagnostics } from '@lwc/errors';
import { isAriaAttribute, isBooleanAttribute, isGlobalHtmlAttribute } from '@lwc/shared';

import { toPropertyName } from '../shared/utils';

import {
    EXPRESSION_SYMBOL_END,
    EXPRESSION_SYMBOL_START,
    isExpression,
    isPotentialExpression,
} from './expression';

import { IRAttribute, IRElement } from '../shared/types';

import {
    ATTR_NAME,
    DATA_RE,
    SVG_NAMESPACE_URI,
    SUPPORTED_SVG_TAGS,
    ATTRS_PROPS_TRANFORMS,
    HTML_ATTRIBUTES_REVERSE_LOOKUP,
    HTML_NAMESPACE_URI,
    HTML_TAG,
    DASHED_TAGNAME_ELEMENT_SET,
    ID_REFERENCING_ATTRIBUTES_SET,
    KNOWN_HTML_ELEMENTS,
    TEMPLATE_DIRECTIVES,
} from './constants';

import { isCustomElement } from '../shared/ir';
import ParserCtx from './parser';

function isQuotedAttribute(rawAttribute: string) {
    const [, value] = rawAttribute.split('=');
    return value && value.startsWith('"') && value.endsWith('"');
}

function isEscapedAttribute(rawAttribute: string) {
    const [, value] = rawAttribute.split('=');
    return !value || !(value.includes('{') && value.includes('}'));
}

export function isIdReferencingAttribute(attrName: string): boolean {
    return ID_REFERENCING_ATTRIBUTES_SET.has(attrName);
}

// http://www.w3.org/1999/xhtml namespace idref elements for which we
// allow id references.
export function isAllowedFragOnlyUrlsXHTML(
    tagName: string,
    attrName: string,
    namespaceURI: string
): boolean {
    const allowed = [HTML_TAG.A, HTML_TAG.AREA];
    return (
        attrName === ATTR_NAME.HREF &&
        allowed.includes(tagName) &&
        namespaceURI === HTML_NAMESPACE_URI
    );
}

// Identifies `href/xlink:href` attributes on `use` elements in the
// http://www.w3.org/2000/svg namespace
export function isSvgUseHref(tagName: string, attrName: string, namespaceURI: string): boolean {
    return (
        // xlink:href is a deprecated attribute included for backwards compatibility
        [ATTR_NAME.HREF, ATTR_NAME.XLINK_HREF].includes(attrName) &&
        tagName === HTML_TAG.USE &&
        namespaceURI === SVG_NAMESPACE_URI
    );
}

export function isFragmentOnlyUrl(url: string): boolean {
    return /^#/.test(url);
}

export function normalizeAttributeValue(
    ctx: ParserCtx,
    raw: string,
    tag: string,
    attr: parse5.Attribute,
    location: parse5.Location
): {
    value: string;
    escapedExpression: boolean;
} {
    const { name, value } = attr;
    if (isBooleanAttribute(name, tag)) {
        if (value === 'true') {
            ctx.throwAtLocation(ParserDiagnostics.BOOLEAN_ATTRIBUTE_TRUE, location, [
                tag,
                name,
                value,
            ]);
        } else if (value === 'false') {
            ctx.throwAtLocation(ParserDiagnostics.BOOLEAN_ATTRIBUTE_FALSE, location, [
                tag,
                name,
                value,
            ]);
        }
    }

    const isQuoted = isQuotedAttribute(raw);
    const isEscaped = isEscapedAttribute(raw);
    if (!isEscaped && isExpression(value)) {
        if (isQuoted) {
            // <input value="{myValue}" />
            // -> ambiguity if the attribute value is a template identifier or a string literal.

            const unquoted = raw.replace(/"/g, '');
            const escaped = raw.replace('"{', '"\\{');

            ctx.throwAtLocation(ParserDiagnostics.AMBIGUOUS_ATTRIBUTE_VALUE, location, [
                raw,
                unquoted,
                escaped,
            ]);
        }

        // <input value={myValue} />
        // -> Valid identifier.
        return { value, escapedExpression: false };
    } else if (!isEscaped && isPotentialExpression(value)) {
        const isExpressionEscaped = value.startsWith(`\\${EXPRESSION_SYMBOL_START}`);
        const isExpressionNextToSelfClosing =
            value.startsWith(EXPRESSION_SYMBOL_START) &&
            value.endsWith(`${EXPRESSION_SYMBOL_END}/`) &&
            !isQuoted;

        if (isExpressionNextToSelfClosing) {
            // <input value={myValue}/>
            // -> By design the html parser consider the / as the last character of the attribute value.
            //    Make sure to remove strip the trailing / for self closing elements.

            return { value: value.slice(0, -1), escapedExpression: false };
        } else if (isExpressionEscaped) {
            // <input value="\{myValue}"/>
            // -> Valid escaped string literal

            return { value: value.slice(1), escapedExpression: true };
        }

        let escaped = raw.replace(/="?/, '="\\');
        escaped += escaped.endsWith('"') ? '' : '"';

        // Throw if the attribute value looks like an expression, but it can't be resolved by the compiler.
        ctx.throwAtLocation(ParserDiagnostics.AMBIGUOUS_ATTRIBUTE_VALUE_STRING, location, [
            raw,
            escaped,
        ]);
    }

    // <input value="myValue"/>
    // -> Valid string literal.
    return { value, escapedExpression: false };
}

export function attributeName(attr: parse5.Attribute): string {
    const { prefix, name } = attr;
    return prefix ? `${prefix}:${name}` : name;
}

export function isProhibitedIsAttribute(attrName: string): boolean {
    return attrName === 'is';
}

export function isTabIndexAttribute(attrName: string): boolean {
    return attrName === 'tabindex';
}

export function isValidTabIndexAttributeValue(value: any): boolean {
    // object means it is a Node representing the expression
    return value === '0' || value === '-1';
}

export function isAriaOrDataOrFmkAttribute(attrName: string): boolean {
    return isAriaAttribute(attrName) || isFmkAttribute(attrName) || isDataAttribute(attrName);
}

function isDataAttribute(attrName: string): boolean {
    return !!attrName.match(DATA_RE);
}

function isFmkAttribute(attrName: string): boolean {
    return attrName === 'key' || attrName === 'slot';
}

export function isAttribute(element: IRElement, attrName: string): boolean {
    if (isCustomElement(element)) {
        return (
            attrName === 'style' ||
            attrName === 'class' ||
            attrName === 'key' ||
            attrName === 'slot' ||
            !!attrName.match(DATA_RE)
        );
    }

    // Handle input tag value="" and checked attributes that are only used for state initialization.
    // Because .setAttribute() won't update the value, those attributes should be considered as props.
    if (element.tag === 'input' && (attrName === 'value' || attrName === 'checked')) {
        return false;
    }

    // Handle global attrs (common to all tags) and special attribute (role, aria, key, is, data-).
    // Handle general case where only standard element have attribute value.
    return true;
}

export function isValidHTMLAttribute(tagName: string, attrName: string): boolean {
    if (
        isGlobalHtmlAttribute(attrName) ||
        isAriaOrDataOrFmkAttribute(attrName) ||
        isTemplateDirective(attrName) ||
        SUPPORTED_SVG_TAGS.has(tagName) ||
        DASHED_TAGNAME_ELEMENT_SET.has(tagName) ||
        !KNOWN_HTML_ELEMENTS.has(tagName)
    ) {
        return true;
    }

    const validElements = HTML_ATTRIBUTES_REVERSE_LOOKUP[attrName];
    return !!validElements && (!validElements.length || validElements.includes(tagName));
}

function isTemplateDirective(attrName: string): boolean {
    return TEMPLATE_DIRECTIVES.some((directive: RegExp) => {
        return directive.test(attrName);
    });
}

/**
 * Convert attribute name from kebab case to camel case property name
 */
export function attributeToPropertyName(attrName: string): string {
    return ATTRS_PROPS_TRANFORMS[attrName] || toPropertyName(attrName);
}

export class ParsedAttribute {
    private readonly attributes: Map<string, IRAttribute> = new Map();

    append(attr: IRAttribute): void {
        this.attributes.set(attr.name, attr);
    }

    get(pattern: string | RegExp): IRAttribute | undefined {
        const key = this.getKey(pattern);
        if (key) {
            return this.attributes.get(key);
        }
    }

    pick(pattern: string | RegExp): IRAttribute | undefined {
        const attr = this.get(pattern);
        if (attr) {
            this.attributes.delete(attr.name);
        }
        return attr;
    }

    private getKey(pattern: string | RegExp): string | undefined {
        let match: string | undefined;
        if (typeof pattern === 'string') {
            match = pattern;
        } else {
            match = Array.from(this.attributes.keys()).find((name) => !!name.match(pattern));
        }
        return match;
    }

    getAttributes(): IRAttribute[] {
        return Array.from(this.attributes.values());
    }
}
