/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    AriaAttrNameToPropNameMap,
    assign,
    create,
    entries,
    hasOwnProperty,
    isNull,
    toString,
} from '@lwc/shared';

import type { LightningElement } from './lightning-element';

/**
 * Map of global attribute or ARIA attribute to the corresponding property name.
 * Not all global attributes are included, just those from `HTMLElementTheGoodParts`.
 */
const attrsToProps = assign(create(null), {
    accesskey: 'accessKey',
    dir: 'dir',
    draggable: 'draggable',
    hidden: 'hidden',
    id: 'id',
    lang: 'lang',
    spellcheck: 'spellcheck',
    tabindex: 'tabIndex',
    title: 'title',
    ...AriaAttrNameToPropNameMap,
});

const stringDescriptor = (attrName: string): TypedPropertyDescriptor<string | null> => ({
    configurable: true,
    enumerable: true,
    get(this: LightningElement): string | null {
        return this.getAttribute(attrName);
    },
    set(this: LightningElement, newValue: string | null): void {
        const currentValue = this.getAttribute(attrName);
        const normalizedValue = String(newValue);
        if (normalizedValue !== currentValue) {
            this.setAttribute(attrName, normalizedValue);
        }
    },
});

const booleanDescriptor = (
    attrName: string,
    defaultValue: boolean
): TypedPropertyDescriptor<boolean> => ({
    configurable: true,
    enumerable: true,
    get(this: LightningElement): boolean {
        const value = this.getAttribute(attrName);
        return value === null ? defaultValue : value === String(defaultValue);
    },
    set(this: LightningElement, newValue: boolean): void {
        const currentValue = this.getAttribute(attrName);
        const normalizedValue = String(Boolean(newValue));
        if (normalizedValue !== currentValue) {
            this.setAttribute(attrName, normalizedValue);
        }
    },
});

const ariaDescriptor = (attrName: string): TypedPropertyDescriptor<string | null> => ({
    configurable: true,
    enumerable: true,
    get(this: LightningElement): string | null {
        return this.getAttribute(attrName);
    },
    set(this: LightningElement, newValue: string | null): void {
        const currentValue = this.getAttribute(attrName);
        if (newValue !== currentValue) {
            // TODO [#3284]: According to the spec, IDL nullable type values
            // (null and undefined) should remove the attribute; however, we
            // only do so in the case of null for historical reasons.
            if (isNull(newValue)) {
                this.removeAttribute(attrName);
            } else {
                this.setAttribute(attrName, toString(newValue));
            }
        }
    },
});

export function reflectAttrToProp(
    instance: LightningElement,
    attrName: string,
    attrValue: string | null
) {
    const reflectedPropName = attrsToProps[attrName as keyof typeof attrsToProps];
    // If it is a reflected property and it was not overriden by the instance
    if (reflectedPropName && !hasOwnProperty.call(instance, reflectedPropName)) {
        const currentValue = (instance as any)[reflectedPropName];
        if (currentValue !== attrValue) {
            (instance as any)[reflectedPropName] = attrValue;
        }
    }
}

export const descriptors: Record<string, PropertyDescriptor> = {
    accessKey: stringDescriptor('accesskey'),
    dir: stringDescriptor('dir'),
    draggable: booleanDescriptor('draggable', true),
    hidden: booleanDescriptor('hidden', true),
    id: stringDescriptor('id'),
    lang: stringDescriptor('lang'),
    spellcheck: booleanDescriptor('spellcheck', false),
    tabIndex: {
        get(this: LightningElement): number {
            const str = this.getAttribute('tabindex');
            const num = Number(str);
            return Number.isNaN(num) ? -1 : Math.trunc(num);
        },
        set(this: LightningElement, newValue: number): void {
            const currentValue = this.getAttribute('tabindex');
            const num = Number(newValue);
            const normalizedValue = isFinite(num) ? String(Math.trunc(num)) : '0';
            if (normalizedValue !== currentValue) {
                this.setAttribute('tabindex', toString(newValue));
            }
        },
    },
    title: stringDescriptor('title'),
};

// Add descriptors for ARIA attributes
for (const [attrName, propName] of entries(AriaAttrNameToPropNameMap)) {
    descriptors[propName] = ariaDescriptor(attrName);
}
