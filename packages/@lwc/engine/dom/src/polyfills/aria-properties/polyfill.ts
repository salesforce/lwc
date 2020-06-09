/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasOwnProperty, AriaPropNameToAttrNameMap } from '@lwc/shared';

type NormalizedAttributeValue = string | null;
type AriaPropMap = Record<string, NormalizedAttributeValue>;

const nodeToAriaPropertyValuesMap: WeakMap<HTMLElement, AriaPropMap> = new WeakMap();

function getAriaPropertyMap(elm: HTMLElement): AriaPropMap {
    let map = nodeToAriaPropertyValuesMap.get(elm);

    if (map === undefined) {
        map = {};
        nodeToAriaPropertyValuesMap.set(elm, map);
    }

    return map;
}

function getNormalizedAriaPropertyValue(value: any): NormalizedAttributeValue {
    return value == null ? null : String(value);
}

function createAriaPropertyPropertyDescriptor(
    propName: string,
    attrName: string
): PropertyDescriptor {
    return {
        get(this: HTMLElement): any {
            const map = getAriaPropertyMap(this);

            if (hasOwnProperty.call(map, propName)) {
                return map[propName];
            }

            // otherwise just reflect what's in the attribute
            return this.hasAttribute(attrName) ? this.getAttribute(attrName) : null;
        },
        set(this: HTMLElement, newValue: any) {
            const normalizedValue = getNormalizedAriaPropertyValue(newValue);

            const map = getAriaPropertyMap(this);
            map[propName] = normalizedValue;

            // reflect into the corresponding attribute
            if (newValue === null) {
                this.removeAttribute(attrName);
            } else {
                this.setAttribute(attrName, newValue);
            }
        },
        configurable: true,
        enumerable: true,
    };
}

export function patch(propName: string) {
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    const attrName = AriaPropNameToAttrNameMap[propName];
    const descriptor = createAriaPropertyPropertyDescriptor(propName, attrName);
    Object.defineProperty(Element.prototype, propName, descriptor);
}
