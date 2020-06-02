/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5-with-errors';
import { ParserDiagnostics, generateCompilerError } from '@lwc/errors';
import { isAriaAttribute } from '@lwc/shared';

import { toPropertyName } from '../shared/utils';

import {
    EXPRESSION_SYMBOL_END,
    EXPRESSION_SYMBOL_START,
    isExpression,
    isPotentialExpression,
} from './expression';

import { IRElement } from '../shared/types';

import {
    ATTR_NAME,
    DATA_RE,
    SVG_NAMESPACE_URI,
    SUPPORTED_SVG_TAGS,
    GLOBAL_ATTRIBUTE_SET,
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

function isQuotedAttribute(rawAttribute: string) {
    const [, value] = rawAttribute.split('=');
    return value && value.startsWith('"') && value.endsWith('"');
}

function isEscapedAttribute(rawAttribute: string) {
    const [, value] = rawAttribute.split('=');
    return !value || !(value.includes('{') && value.includes('}'));
}

const booleanAttributes = new Set<string>([
    'autofocus', // <button>, <input>, <keygen>, <select>, <textarea>
    'autoplay', // <audio>, <video>
    'capture', // <input type='file'>
    'checked', // <command>, <input>
    'disabled', // <button>, <command>, <fieldset>, <input>, <keygen>, <optgroup>, <option>, <select>, <textarea>
    'formnovalidate', // submit button
    'hidden', // Global attribute
    'loop', // <audio>, <bgsound>, <marquee>, <video>
    'multiple', // <input>, <select>
    'muted', // <audio>, <video>
    'novalidate', // <form>
    'open', // <details>
    'readonly', // <input>, <textarea>
    'required', // <input>, <select>, <textarea>
    'reversed', // <ol>
    'selected', // <option>
]);

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
    attr: parse5.AST.Default.Attribute,
    raw: string,
    tag: string
): {
    value: string;
    escapedExpression: boolean;
} {
    const { name, value } = attr;
    if (booleanAttributes.has(name)) {
        if (value === 'true') {
            throw generateCompilerError(ParserDiagnostics.BOOLEAN_ATTRIBUTE_TRUE, {
                messageArgs: [tag, name, value],
            });
        } else if (value === 'false') {
            throw generateCompilerError(ParserDiagnostics.BOOLEAN_ATTRIBUTE_FALSE, {
                messageArgs: [tag, name, value],
            });
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

            throw generateCompilerError(ParserDiagnostics.AMBIGUOUS_ATTRIBUTE_VALUE, {
                messageArgs: [raw, unquoted, escaped],
            });
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
        throw generateCompilerError(ParserDiagnostics.AMBIGUOUS_ATTRIBUTE_VALUE_STRING, {
            messageArgs: [raw, escaped],
        });
    }

    // <input value="myValue"/>
    // -> Valid string literal.
    return { value, escapedExpression: false };
}

export function attributeName(attr: parse5.AST.Default.Attribute): string {
    const { prefix, name } = attr;
    return prefix ? `${prefix}:${name}` : name;
}

export function getAttribute(
    el: IRElement,
    pattern: string | RegExp
): parse5.AST.Default.Attribute | undefined {
    return el.attrsList.find((attr) =>
        typeof pattern === 'string'
            ? attributeName(attr) === pattern
            : !!attributeName(attr).match(pattern)
    );
}

export function removeAttribute(el: IRElement, pattern: string | RegExp): void {
    el.attrsList = el.attrsList.filter((attr) =>
        typeof pattern === 'string'
            ? attributeName(attr) !== pattern
            : !attributeName(attr).match(pattern)
    );
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

function isCustomElementAttribute(attrName: string): boolean {
    return attrName === 'key' || attrName === 'slot' || !!attrName.match(DATA_RE);
}

function isInputStateAttribute(element: IRElement, attrName: string) {
    return element.tag === 'input' && (attrName === 'value' || attrName === 'checked');
}

export function isAttribute(element: IRElement, attrName: string): boolean {
    const isCustom = isCustomElement(element);
    if (isCustom) {
        return isCustomElementAttribute(attrName);
    }

    if (booleanAttributes.has(attrName)) {
        return false;
    }

    // Handle global attrs (common to all tags) and special attribute (role, aria, key, is, data-).
    if (GLOBAL_ATTRIBUTE_SET.has(attrName) || isAriaOrDataOrFmkAttribute(attrName)) {
        return true;
    }

    // Handle input tag value="" and checked attributes that are only used for state initialization.
    // Because .setAttribute() won't update the value, those attributes should be considered as props.
    if (isInputStateAttribute(element, attrName)) {
        return false;
    }

    // Handle general case where only standard element have attribute value.
    return !isCustomElement(element);
}

export function isValidHTMLAttribute(tagName: string, attrName: string): boolean {
    if (
        GLOBAL_ATTRIBUTE_SET.has(attrName) ||
        isAriaOrDataOrFmkAttribute(attrName) ||
        SUPPORTED_SVG_TAGS.has(tagName) ||
        DASHED_TAGNAME_ELEMENT_SET.has(tagName) ||
        isTemplateDirective(attrName) ||
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

function shouldCamelCaseAttribute(element: IRElement, attrName: string) {
    const { tag } = element;
    const isDataAttributeOrFmk = isDataAttribute(attrName) || isFmkAttribute(attrName);
    const isSvgTag = SUPPORTED_SVG_TAGS.has(tag);
    return !isSvgTag && !isDataAttributeOrFmk;
}

export function attributeToPropertyName(element: IRElement, attrName: string): string {
    if (!shouldCamelCaseAttribute) {
        return attrName;
    }
    return toPropertyName(ATTRS_PROPS_TRANFORMS[attrName] || attrName);
}
