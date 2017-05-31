import * as parse5 from 'parse5';
import * as camelcase from 'camelcase';

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
    SVG_TAG_SET,
    DATA_ARIA_RE,
    GLOBAL_ATTRIBUTE_SET,
    ATTRS_PROPS_TRANFORMS,
    BLACKLISTED_ATTRIBUTE_SET,
    HTML_ATTRIBUTES_REVERSE_LOOKUP,
} from './constants';

import {
    isCustomElement,
} from '../shared/ir';

function isQuotedAttribute(rawAttribute: string) {
    const [, value] = rawAttribute.split('=');
    return value && value.startsWith('"') && value.endsWith('"');
}

export function normalizeAttributeValue(
    attr: parse5.AST.Default.Attribute,
    raw: string,
): string {
    const { value } = attr;
    const isQuoted = isQuotedAttribute(raw);

    if (isExpression(value)) {
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
        return value;
    } else if (isPotentialExpression(value)) {

        const isExpressionEscaped = value.startsWith(`\\${EXPRESSION_SYMBOL_START}`);
        const isExpressionNextToSelfClosing = value.startsWith(EXPRESSION_SYMBOL_START)
            && value.endsWith(`${EXPRESSION_SYMBOL_END}/`)
            && !isQuoted;

        if (isExpressionNextToSelfClosing) {
            // <input value={myValue}/>
            // -> By design the html parser consider the / as the last character of the attribute value.
            //    Make sure to remove strip the trailing / for self closing elements.

            return value.slice(0, -1);
        } else if (isExpressionEscaped) {
            // <input value="\{myValue}"/>
            // -> Valid escaped string literal

            return value.slice(1);
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
    return value;
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
        !attributeName(attr).match(pattern)
    ));
}

export function isAriaOrDataOrFmkAttribute(attrName: string): boolean {
    return attrName === 'role' || attrName === 'is' || attrName === 'key' || !!attrName.match(DATA_ARIA_RE);
}

// TODO: We will be adding more whitelisting here as we find bugs...
function isInputSpecialCase({ tag }: IRElement, attrName: string) {
    return tag === 'input' && attrName !== 'type';
}

/*
* Attribute vs. Prop
* We consider is an attribute if any of the conditions apply:
* 1) Is a special attribute (role, aria, key, is, data-)
* 2) Is a global attr (commong to all tags)
* 3) Is an html with no `is` and its not an input tag (input is special)
* 4) If has an is attr and is a valid HTMl for the current tagName
*/
export function isAttribute(element: IRElement, attrName: string): boolean {
    const hasIsAttr = !!getAttribute(element, 'is');

    return GLOBAL_ATTRIBUTE_SET.has(attrName) ||
           isAriaOrDataOrFmkAttribute(attrName) ||
           (!isCustomElement(element) && !hasIsAttr && !isInputSpecialCase(element, attrName)) ||
           (hasIsAttr && isValidHTMLAttribute(element.tag, attrName));
}

export function isProp(element: IRElement, attrName: string) {
    return !isAttribute(element, attrName);
}

export function isValidHTMLAttribute(tagName: string, attrName: string): boolean {
    if (isAriaOrDataOrFmkAttribute(attrName) || SVG_TAG_SET.has(tagName)) {
        return true;
    }

    const validElements = HTML_ATTRIBUTES_REVERSE_LOOKUP[attrName];
    return !!validElements &&  (!validElements.length || validElements.includes(tagName));
}

export function attributeToPropertyName(element: IRElement, attrName: string): string {
    const { tag } = element;

    let propName = attrName;
    if (!SVG_TAG_SET.has(tag) && !isAriaOrDataOrFmkAttribute(attrName) && !isCustomElement(element)) {
        propName = ATTRS_PROPS_TRANFORMS[propName] || propName;
    }

    return camelcase(propName);
}

export function isBlacklistedAttribute(attrName: string): boolean {
    return BLACKLISTED_ATTRIBUTE_SET.has(attrName);
}
