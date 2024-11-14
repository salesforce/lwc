/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    AriaAttrNameToPropNameMap,
    create,
    entries,
    htmlPropertyToAttribute,
    isAriaAttribute,
    isGlobalHtmlAttribute,
    isNull,
    keys,
    toString,
} from '@lwc/shared';

import type { LightningElement } from './lightning-element';

/**
 * Filters out the following types of properties that should not be set.
 * - Properties that are not public.
 * - Properties that are not global.
 * - Properties that are global but are internally overridden.
 */
export function filterProperties(
    props: Record<string, unknown>,
    publicFields: Array<string>,
    privateFields: Array<string>
): Record<string, unknown> {
    const propsToAssign = create(null);
    const publicFieldSet = new Set(publicFields);
    const privateFieldSet = new Set(privateFields);
    keys(props).forEach((propName) => {
        const attrName = htmlPropertyToAttribute(propName);
        if (
            publicFieldSet.has(propName) ||
            ((isGlobalHtmlAttribute(attrName) || isAriaAttribute(attrName)) &&
                !privateFieldSet.has(propName))
        ) {
            propsToAssign[propName] = props[propName];
        }
    });
    return propsToAssign;
}

/**
 * Descriptor for IDL attribute reflections that merely reflect the string, e.g. `title`.
 */
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

/** Descriptor for a boolean that checks for `attr="true"` or `attr="false"`, e.g. `spellcheck` and `draggable`. */
const explicitBooleanDescriptor = (
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

/**
 * Descriptor for a "true" boolean attribute that checks solely for presence, e.g. `hidden`.
 */
const booleanAttributeDescriptor = (attrName: string): TypedPropertyDescriptor<boolean> => ({
    configurable: true,
    enumerable: true,
    get(this: LightningElement): boolean {
        return this.hasAttribute(attrName);
    },
    set(this: LightningElement, newValue: boolean): void {
        const hasAttribute = this.hasAttribute(attrName);
        if (newValue) {
            if (!hasAttribute) {
                this.setAttribute(attrName, '');
            }
        } else {
            if (hasAttribute) {
                this.removeAttribute(attrName);
            }
        }
    },
});

/**
 * Descriptor for ARIA reflections, e.g. `ariaLabel` and `role`.
 */
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

export const descriptors: Record<string, PropertyDescriptor> = {
    accessKey: stringDescriptor('accesskey'),
    dir: stringDescriptor('dir'),
    draggable: explicitBooleanDescriptor('draggable', true),
    hidden: booleanAttributeDescriptor('hidden'),
    id: stringDescriptor('id'),
    lang: stringDescriptor('lang'),
    spellcheck: explicitBooleanDescriptor('spellcheck', false),
    tabIndex: {
        configurable: true,
        enumerable: true,
        get(this: LightningElement): number {
            const str = this.getAttribute('tabindex');
            const num = Number(str);
            return isFinite(num) ? Math.trunc(num) : -1;
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
