/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { AriaAttrNameToPropNameMap, entries, isNull, toString } from '@lwc/shared';

import type { LightningElement } from './lightning-element';

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
        if (value === null) return defaultValue;
        // spellcheck=false => false, everything else => true
        // draggable=true => true, everything else => false
        return value.toLowerCase() === String(defaultValue) ? defaultValue : !defaultValue;
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
 * Descriptor for `translate`, which reflects as `yes` / `no` and defaults to `true`.
 */
const translateDescriptor = (): TypedPropertyDescriptor<boolean> => ({
    configurable: true,
    enumerable: true,
    get(this: LightningElement): boolean {
        const value = this.getAttribute('translate');
        return value === null ? true : value.toLowerCase() !== 'no';
    },
    set(this: LightningElement, newValue: boolean): void {
        const currentValue = this.getAttribute('translate');
        const normalizedValue = newValue ? 'yes' : 'no';
        if (normalizedValue !== currentValue) {
            this.setAttribute('translate', normalizedValue);
        }
    },
});

/**
 * Descriptor for `contentEditable`, which defaults to `inherit` when the attribute is absent.
 */
const contentEditableDescriptor = (): TypedPropertyDescriptor<string> => ({
    configurable: true,
    enumerable: true,
    get(this: LightningElement): string {
        return this.getAttribute('contenteditable') ?? 'inherit';
    },
    set(this: LightningElement, newValue: string): void {
        const currentValue = this.getAttribute('contenteditable');
        const normalizedValue = String(newValue);
        if (normalizedValue === 'inherit') {
            if (currentValue !== null) {
                this.removeAttribute('contenteditable');
            }
            return;
        }
        if (normalizedValue !== currentValue) {
            this.setAttribute('contenteditable', normalizedValue);
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

const tabIndexDescriptor = (): TypedPropertyDescriptor<number> => ({
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
});

export const descriptors: Record<string, PropertyDescriptor> = {
    accessKey: stringDescriptor('accesskey'),
    autocapitalize: stringDescriptor('autocapitalize'),
    autofocus: booleanAttributeDescriptor('autofocus'),
    contentEditable: contentEditableDescriptor(),
    dir: stringDescriptor('dir'),
    draggable: explicitBooleanDescriptor('draggable', true),
    enterKeyHint: stringDescriptor('enterkeyhint'),
    hidden: booleanAttributeDescriptor('hidden'),
    id: stringDescriptor('id'),
    inert: booleanAttributeDescriptor('inert'),
    inputMode: stringDescriptor('inputmode'),
    lang: stringDescriptor('lang'),
    nonce: stringDescriptor('nonce'),
    popover: stringDescriptor('popover'),
    spellcheck: explicitBooleanDescriptor('spellcheck', false),
    tabIndex: tabIndexDescriptor(),
    title: stringDescriptor('title'),
    translate: translateDescriptor(),
    writingSuggestions: explicitBooleanDescriptor('writingsuggestions', true),
};

// Add descriptors for ARIA attributes
for (const [attrName, propName] of entries(AriaAttrNameToPropNameMap)) {
    descriptors[propName] = ariaDescriptor(attrName);
}
