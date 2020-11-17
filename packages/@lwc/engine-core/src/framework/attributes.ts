/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assign,
    create,
    forEach,
    isUndefined,
    AriaAttrNameToPropNameMap,
    AriaPropNameToAttrNameMap,
    StringReplace,
    StringToLowerCase,
} from '@lwc/shared';

// These properties get added to LWCElement.prototype publicProps automatically
export const defaultDefHTMLPropertyNames = [
    'accessKey',
    'dir',
    'draggable',
    'hidden',
    'id',
    'lang',
    'spellcheck',
    'tabIndex',
    'title',
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

const AttrNameToPropNameMap: Record<string, string> = assign(
    create(null),
    AriaAttrNameToPropNameMap
);
const PropNameToAttrNameMap: Record<string, string> = assign(
    create(null),
    AriaPropNameToAttrNameMap
);

forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, (propName) => {
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
        AttrNameToPropNameMap[attrName] = StringReplace.call(attrName, CAMEL_REGEX, (g) =>
            g[1].toUpperCase()
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
            (match) => '-' + match.toLowerCase()
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
