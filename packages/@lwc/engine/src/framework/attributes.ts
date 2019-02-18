/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ElementPrototypeAriaPropertyNames } from '../polyfills/aria-properties/main';
import { StringToLowerCase, StringReplace, create, forEach, isUndefined } from '../shared/language';

// These properties get added to LWCElement.prototype publicProps automatically
export const defaultDefHTMLPropertyNames = [
    'dir',
    'id',
    'accessKey',
    'title',
    'lang',
    'hidden',
    'draggable',
    'tabIndex',
];

// Few more exceptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.
const HTMLPropertyNamesWithLowercasedReflectiveAttributes = [
    'accessKey',
    'readOnly',
    'tabIndex',
    'bgColor',
    'colSpan',
    'rowSpan',
    'contentEditable',
    'dateTime',
    'formAction',
    'isMap',
    'maxLength',
    'useMap',
];

const OffsetPropertiesError =
    'This property will round the value to an integer, and it is considered an anti-pattern. Instead, you can use `this.getBoundingClientRect()` to obtain `left`, `top`, `right`, `bottom`, `x`, `y`, `width`, and `height` fractional values describing the overall border-box in pixels.';

// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
export function getGlobalHTMLPropertiesInfo() {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    return {
        id: {
            attribute: 'id',
            reflective: true,
        },
        accessKey: {
            attribute: 'accesskey',
            reflective: true,
        },
        accessKeyLabel: {
            readOnly: true,
        },
        className: {
            attribute: 'class',
            error: `Using property "className" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property "classList".`,
        },
        contentEditable: {
            attribute: 'contenteditable',
            reflective: true,
        },
        isContentEditable: {
            readOnly: true,
        },
        contextMenu: {
            attribute: 'contextmenu',
        },
        dataset: {
            readOnly: true,
            error:
                'Using property "dataset" is an anti-pattern. Components should not rely on dataset to implement its internal logic, nor use that as a communication channel.',
        },
        dir: {
            attribute: 'dir',
            reflective: true,
        },
        draggable: {
            attribute: 'draggable',
            experimental: true,
            reflective: true,
        },
        dropzone: {
            attribute: 'dropzone',
            readOnly: true,
            experimental: true,
        },
        hidden: {
            attribute: 'hidden',
            reflective: true,
        },
        itemScope: {
            attribute: 'itemscope',
            experimental: true,
        },
        itemType: {
            attribute: 'itemtype',
            readOnly: true,
            experimental: true,
        },
        itemId: {
            attribute: 'itemid',
            experimental: true,
        },
        itemRef: {
            attribute: 'itemref',
            readOnly: true,
            experimental: true,
        },
        itemProp: {
            attribute: 'itemprop',
            readOnly: true,
            experimental: true,
        },
        itemValue: {
            experimental: true,
        },
        lang: {
            attribute: 'lang',
            reflective: true,
        },
        offsetHeight: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetLeft: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetParent: {
            readOnly: true,
        },
        offsetTop: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetWidth: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        properties: {
            readOnly: true,
            experimental: true,
        },
        spellcheck: {
            experimental: true,
            reflective: true,
        },
        style: {
            attribute: 'style',
            error: `Using property or attribute "style" is an anti-pattern. Instead use property "classList".`,
        },
        tabIndex: {
            attribute: 'tabindex',
            reflective: true,
        },
        title: {
            attribute: 'title',
            reflective: true,
        },
        translate: {
            experimental: true,
        },
        // additional global attributes that are not present in the link above.
        role: {
            attribute: 'role',
        },
        slot: {
            attribute: 'slot',
            experimental: true,
            error: `Using property or attribute "slot" is an anti-pattern.`,
        },
    };
}

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element

// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

const AttrNameToPropNameMap: Record<string, string> = create(null);
const PropNameToAttrNameMap: Record<string, string> = create(null);

// Synthetic creation of all AOM property descriptors for Custom Elements
forEach.call(ElementPrototypeAriaPropertyNames, (propName: string) => {
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    const attrName = StringToLowerCase.call(StringReplace.call(propName, /^aria/, 'aria-'));
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

forEach.call(defaultDefHTMLPropertyNames, propName => {
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, propName => {
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

const CAMEL_REGEX = /-([a-z])/g;

/**
 * This method maps between attribute names
 * and the corresponding property name.
 */
export function getPropNameFromAttrName(attrName: string): string {
    if (isUndefined(AttrNameToPropNameMap[attrName])) {
        AttrNameToPropNameMap[attrName] = StringReplace.call(
            attrName,
            CAMEL_REGEX,
            (g: string): string => g[1].toUpperCase(),
        );
    }
    return AttrNameToPropNameMap[attrName];
}

const CAPS_REGEX = /[A-Z]/g;

/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
export function getAttrNameFromPropName(propName: string): string {
    if (isUndefined(PropNameToAttrNameMap[propName])) {
        PropNameToAttrNameMap[propName] = StringReplace.call(
            propName,
            CAPS_REGEX,
            (match: string): string => '-' + match.toLowerCase(),
        );
    }
    return PropNameToAttrNameMap[propName];
}

let controlledElement: Element | null = null;
let controlledAttributeName: string | void;

export function isAttributeLocked(elm: Element, attrName: string): boolean {
    return elm !== controlledElement || attrName !== controlledAttributeName;
}

export function lockAttribute(_elm: Element, _key: string) {
    controlledElement = null;
    controlledAttributeName = undefined;
}

export function unlockAttribute(elm: Element, key: string) {
    controlledElement = elm;
    controlledAttributeName = key;
}
