/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// At runtime, we don't have access to the DOM, so we don't want TypeScript to allow accessing DOM
// globals. However, we're mimicking DOM functionality here, so we *do* want access to DOM types.
// To access the real DOM types when writing new code, uncomment the line below and comment out the
// stub types. Switch them back when you're done to validate that you're not accidentally using
// DOM globals. IMPORTANT: The comment below is a "triple slash directive", it must start with ///
// and be located before import statements.
// /// <reference lib="dom" />

import { htmlPropertyToAttribute } from '@lwc/shared';
import { ClassList } from './class-list';
import { Attributes } from './types';
import { mutationTracker } from './mutation-tracker';

type EventListenerOrEventListenerObject = unknown;
type AddEventListenerOptions = unknown;
type EventListenerOptions = unknown;
type ShadowRoot = unknown;

export type LightningElementConstructor = typeof LightningElement;

interface PropsAvailableAtConstruction {
    tagName: string;
}

export const SYMBOL__SET_INTERNALS = Symbol('set-internals');

export class LightningElement implements PropsAvailableAtConstruction {
    static renderMode?: 'light' | 'shadow';

    isConnected = false;
    className = '';

    // Using ! because it's assigned in the constructor via `Object.assign`, which TS can't detect
    tagName!: string;

    #attrs!: Attributes;
    #classList: ClassList | null = null;

    constructor(
        propsAvailableAtConstruction: PropsAvailableAtConstruction & Record<string, unknown>
    ) {
        Object.assign(this, propsAvailableAtConstruction);
    }

    [SYMBOL__SET_INTERNALS](
        props: Record<string, any>,
        reflectedProps: string[],
        attrs: Record<string, any>
    ) {
        Object.assign(this, props);
        this.#attrs = attrs;

        // Whenever a reflected prop changes, we'll update the original props object
        // that was passed in. That'll be referenced when the attrs are rendered later.
        for (const reflectedPropName of reflectedProps) {
            Object.defineProperty(this, reflectedPropName, {
                get() {
                    return props[reflectedPropName] ?? null;
                },
                set(newValue) {
                    props[reflectedPropName] = newValue;
                    mutationTracker.add(this, htmlPropertyToAttribute(reflectedPropName));
                },
                enumerable: true,
            });
        }

        Object.defineProperty(this, 'className', {
            get() {
                return props.class ?? '';
            },
            set(newVal) {
                props.class = newVal;
                attrs.class = newVal;
                mutationTracker.add(this, 'class');
            },
        });
    }

    get classList() {
        if (this.#classList) {
            return this.#classList;
        }
        return (this.#classList = new ClassList(this));
    }

    #setAttribute(attrName: string, attrValue: string | null): void {
        this.#attrs[attrName] = attrValue;
        mutationTracker.add(this, attrName);
    }

    setAttribute(attrName: string, attrValue: unknown): void {
        this.#setAttribute(attrName, String(attrValue));
    }

    getAttribute(attrName: unknown): string | null {
        if (this.hasAttribute(attrName)) {
            return this.#attrs[attrName as string];
        }
        return null;
    }

    hasAttribute(attrName: unknown): boolean {
        return typeof attrName === 'string' && typeof this.#attrs[attrName] === 'string';
    }

    removeAttribute(attrName: string): void {
        if (this.hasAttribute(attrName)) {
            // Reflected attributes use accessor methods to update their
            // corresponding properties so we can't simply `delete`. Instead,
            // we use `null` when we want to remove.
            this.#setAttribute(attrName, null);
        } else {
            // This interprets the removal of a non-existing attribute as an
            // attribute mutation. We may want to revisit this.
            mutationTracker.add(this, attrName);
        }
    }

    addEventListener(
        _type: string,
        _listener: EventListenerOrEventListenerObject,
        _options?: boolean | AddEventListenerOptions
    ): void {
        // noop
    }

    removeEventListener(
        _type: string,
        _listener: EventListenerOrEventListenerObject,
        _options?: boolean | EventListenerOptions
    ): void {
        // noop
    }

    // ----------------------------------------------------------- //
    // Props/methods explicitly not available in this environment  //
    // Getters are named "get*" for parity with @lwc/engine-server //
    // ----------------------------------------------------------- //

    get children(): never {
        throw new TypeError('"getChildren" is not supported in this environment');
    }
    get childNodes(): never {
        throw new TypeError('"getChildNodes" is not supported in this environment');
    }
    get firstChild(): never {
        throw new TypeError('"getFirstChild" is not supported in this environment');
    }
    get firstElementChild(): never {
        throw new TypeError('"getFirstElementChild" is not supported in this environment');
    }
    get hostElement(): never {
        // Intentionally different to match @lwc/engine-*core*
        throw new TypeError('this.hostElement is not supported in this environment');
    }
    get lastChild(): never {
        throw new TypeError('"getLastChild" is not supported in this environment');
    }
    get lastElementChild(): never {
        throw new TypeError('"getLastElementChild" is not supported in this environment');
    }
    get ownerDocument(): never {
        // Intentionally not "get*" to match @lwc/engine-server
        throw new TypeError('"ownerDocument" is not supported in this environment');
    }
    get style(): never {
        // Intentionally not "get*" to match @lwc/engine-server
        throw new TypeError('"style" is not supported in this environment');
    }

    attachInternals(): never {
        throw new TypeError('"attachInternals" is not supported in this environment');
    }
    dispatchEvent(_event: Event): never {
        throw new TypeError('"dispatchEvent" is not supported in this environment');
    }
    getBoundingClientRect(): never {
        throw new TypeError('"getBoundingClientRect" is not supported in this environment');
    }
    getElementsByClassName(_classNames: string): never {
        throw new TypeError('"getElementsByClassName" is not supported in this environment');
    }
    getElementsByTagName(_qualifiedName: unknown): never {
        throw new TypeError('"getElementsByTagName" is not supported in this environment');
    }
    querySelector(_selectors: string): never {
        throw new TypeError('"querySelector" is not supported in this environment');
    }
    querySelectorAll(_selectors: string): never {
        throw new TypeError('"querySelectorAll" is not supported in this environment');
    }

    // -------------------------------------------------------------------------------- //
    // Stubs to satisfy the HTMLElementTheGoodParts (from @lwc/engine-core) interface //
    // The interface is not explicitly referenced here, so this may become outdated //
    // -------------------------------------------------------------------------- //

    accessKey?: string;
    dir?: string;
    draggable?: boolean;
    hidden?: boolean;
    id?: string;
    lang?: string;
    shadowRoot?: ShadowRoot | null;
    spellcheck?: boolean;
    tabIndex?: number;
    title?: string;

    getAttributeNS(_namespace: string | null, _localName: string): string | null {
        throw new Error('Method "getAttributeNS" not implemented.');
    }
    hasAttributeNS(_namespace: string | null, _localName: string): boolean {
        throw new Error('Method "hasAttributeNS" not implemented.');
    }
    removeAttributeNS(_namespace: string | null, _localName: string): void {
        throw new Error('Method "removeAttributeNS" not implemented.');
    }
    setAttributeNS(_namespace: string | null, _qualifiedName: string, _value: string): void {
        throw new Error('Method "setAttributeNS" not implemented.');
    }
}
