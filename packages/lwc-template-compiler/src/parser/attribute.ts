import * as parse5 from 'parse5-with-errors';
import camelcase from 'camelcase';

import {
    EXPRESSION_SYMBOL_END,
    EXPRESSION_SYMBOL_START,
    isExpression,
    isPotentialExpression,
} from './expression';

import {
    IRElement,
} from '../shared/types';

import {
    DATA_RE,
    ALLOWED_SVG_TAG_SET,
    ARIA_RE,
    GLOBAL_ATTRIBUTE_SET,
    STATIC_ATTRIBUTE_SET,
    ATTRS_PROPS_TRANFORMS,
    HTML_ATTRIBUTES_REVERSE_LOOKUP,
    DASHED_TAGNAME_ELEMENT_SET,
} from './constants';

import {
    isCustomElement,
} from '../shared/ir';

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

export function isRestrictedStaticAttribute(attrName: string): boolean {
    return STATIC_ATTRIBUTE_SET.has(attrName);
}

export function normalizeAttributeValue(
    attr: parse5.AST.Default.Attribute,
    raw: string,
    tag: string,
): {
    value: string,
    escapedExpression: boolean,
} {
    const { name, value } = attr;
    if (booleanAttributes.has(name)) {
        if (value === 'true') {
            throw new Error([
                `To set a boolean attributes, try <${tag} ${name}> instead of <${tag} ${name}="${value}">.`,
                'If the attribute is present, its value must either be the empty string',
                'or a value that is an ASCII case -insensitive match for the attribute\'s canonical name',
                'with no leading or trailing whitespace.',
            ].join(''));
        } else if (value === 'false') {
            throw new Error([
                `To not set a boolean attribute, try <${tag}> instead of <${tag} ${name}="${value}">.`,
                'To represent a false value, the attribute has to be omitted altogether.',
            ].join(' '));
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

            const err = new Error([
                `Ambiguous attribute value ${raw}.`,
                `If you want to make it a valid identifier you should remove the surrounding quotes ${unquoted}.`,
                `If you want to make it a string you should escape it ${escaped}.`,
            ].join(' '));

            throw err;
        }

        // <input value={myValue} />
        // -> Valid identifier.
        return { value, escapedExpression: false };
    } else if (!isEscaped && isPotentialExpression(value)) {

        const isExpressionEscaped = value.startsWith(`\\${EXPRESSION_SYMBOL_START}`);
        const isExpressionNextToSelfClosing = value.startsWith(EXPRESSION_SYMBOL_START)
            && value.endsWith(`${EXPRESSION_SYMBOL_END}/`)
            && !isQuoted;

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
        throw new Error(
            `Ambiguous attribute value ${raw}. If you want to make it a string you should escape it ${escaped}`,
        );
    }

    // <input value="myValue"/>
    // -> Valid string literal.
    return { value, escapedExpression: false };
}

export function attributeName(attr: parse5.AST.Default.Attribute): string {
    const { prefix, name } = attr;
    return prefix ? `${prefix}:${name}` : name;
}

export function getAttribute(el: IRElement, pattern: string | RegExp): parse5.AST.Default.Attribute | undefined {
    return el.attrsList.find((attr) => (
        typeof pattern === 'string' ?
            attributeName(attr) === pattern :
            !!attributeName(attr).match(pattern)
    ));
}

export function removeAttribute(el: IRElement, pattern: string | RegExp): void {
    el.attrsList = el.attrsList.filter((attr) => (
        typeof pattern === 'string' ?
            attributeName(attr) !== pattern :
            !attributeName(attr).match(pattern)
    ));
}

function isAriaAttribute(attrName: string): boolean {
    return attrName === 'role' || ARIA_RE.test(attrName);
}

export function isAriaOrDataOrFmkAttribute(attrName: string): boolean {
    return (
        isAriaAttribute(attrName) ||
        isFmkAttribute(attrName) ||
        isDataAttribute(attrName)
    );
}

function isDataAttribute(attrName: string): boolean {
    return !!attrName.match(DATA_RE);
}

function isFmkAttribute(attrName: string): boolean {
    return (
        attrName === 'is' ||
        attrName === 'key' ||
        attrName === 'slot'
    );
}

function isCustomElementAttribute(attrName: string): boolean {
    return (
        attrName === 'is' ||
        attrName === 'key' ||
        attrName === 'slot' ||
        !!attrName.match(DATA_RE)
    );
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

    // Handle attributes applied to a subclassed element via the is="" attribute.
    // Returns true only attributes that are valid attribute for the base element.
    const hasIsAttr = !!getAttribute(element, 'is');
    if (hasIsAttr) {
        return isValidHTMLAttribute(element.tag, attrName);
    }

    // Handle general case where only standard element have attribute value.
    return !isCustomElement(element);
}

export function isValidHTMLAttribute(tagName: string, attrName: string): boolean {
    if (GLOBAL_ATTRIBUTE_SET.has(attrName) ||
        isAriaOrDataOrFmkAttribute(attrName) ||
        ALLOWED_SVG_TAG_SET.has(tagName) ||
        DASHED_TAGNAME_ELEMENT_SET.has(tagName)) {
        return true;
    }

    const validElements = HTML_ATTRIBUTES_REVERSE_LOOKUP[attrName];
    return !!validElements &&  (!validElements.length || validElements.includes(tagName));
}

function shouldCamelCaseAttribute(element: IRElement, attrName: string) {
    const { tag } = element;
    const isDataAttributeOrFmk = isDataAttribute(attrName) || isFmkAttribute(attrName);
    const isSvgTag = ALLOWED_SVG_TAG_SET.has(tag);
    return (
        !isSvgTag &&
        !isDataAttributeOrFmk
    );
}

export function attributeToPropertyName(element: IRElement, attrName: string): string {
    let propName = attrName;
    if (shouldCamelCaseAttribute(element, attrName)) {
        propName = ATTRS_PROPS_TRANFORMS[propName] || propName;
    }

    return camelcase(propName);
}
