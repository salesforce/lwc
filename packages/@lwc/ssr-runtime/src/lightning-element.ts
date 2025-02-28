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

import {
    assign,
    defineProperties,
    hasOwnProperty,
    htmlPropertyToAttribute,
    isAriaAttribute,
    keys,
    REFLECTIVE_GLOBAL_PROPERTY_SET,
    StringToLowerCase,
    toString,
} from '@lwc/shared';

import { ClassList } from './class-list';
import { mutationTracker } from './mutation-tracker';
import { descriptors as reflectionDescriptors } from './reflection';
import { getReadOnlyProxy } from './get-read-only-proxy';
import type { Attributes, Properties } from './types';
import type { Stylesheets } from '@lwc/shared';

type EventListenerOrEventListenerObject = unknown;
type AddEventListenerOptions = unknown;
type EventListenerOptions = unknown;
type ShadowRoot = unknown;

export type LightningElementConstructor = typeof LightningElement;

interface PropsAvailableAtConstruction {
    tagName: string;
}

export const SYMBOL__SET_INTERNALS = Symbol('set-internals');
export const SYMBOL__GENERATE_MARKUP = Symbol('generate-markup');
export const SYMBOL__DEFAULT_TEMPLATE = Symbol('default-template');

export class LightningElement implements PropsAvailableAtConstruction {
    static renderMode?: 'light' | 'shadow';
    static stylesheets?: Stylesheets;

    // Using ! because these are defined by descriptors in ./reflection
    accessKey!: string;
    dir!: string;
    draggable!: boolean;
    hidden!: boolean;
    id!: string;
    lang!: string;
    spellcheck!: boolean;
    tabIndex!: number;
    title!: string;

    isConnected = false;

    // Using ! because it's assigned in the constructor via `Object.assign`, which TS can't detect
    tagName!: string;

    #props!: Properties;
    #attrs!: Attributes;
    #classList: ClassList | null = null;

    constructor(propsAvailableAtConstruction: PropsAvailableAtConstruction & Properties) {
        assign(this, propsAvailableAtConstruction);
    }

    [SYMBOL__SET_INTERNALS](props: Properties, attrs: Attributes, publicProperties: Set<string>) {
        this.#props = props;
        this.#attrs = attrs;

        // Class should be set explicitly to avoid it being overridden by connectedCallback classList mutation.
        if (attrs.class) {
            this.className = attrs.class;
        }

        // Avoid setting the following types of properties that should not be set:
        // - Properties that are not public.
        // - Properties that are not global.
        for (const propName of keys(props)) {
            const attrName = htmlPropertyToAttribute(propName);
            if (
                publicProperties.has(propName) ||
                REFLECTIVE_GLOBAL_PROPERTY_SET.has(propName) ||
                isAriaAttribute(attrName)
            ) {
                // For props passed from parents to children, they are intended to be read-only
                // to avoid a child mutating its parent's state
                (this as any)[propName] = getReadOnlyProxy(props[propName]);
            }
        }
    }

    get className() {
        return this.#props.class ?? '';
    }

    set className(newVal: any) {
        this.#props.class = newVal;
        this.#attrs.class = newVal;
        mutationTracker.add(this, 'class');
    }

    get classList() {
        if (this.#classList) {
            return this.#classList;
        }
        return (this.#classList = new ClassList(this));
    }

    setAttribute(attrName: string, attrValue: string): void {
        const normalizedName = StringToLowerCase.call(toString(attrName));
        const normalizedValue = String(attrValue);
        this.#attrs[normalizedName] = normalizedValue;
        mutationTracker.add(this, normalizedName);
    }

    getAttribute(attrName: string): string | null {
        const normalizedName = StringToLowerCase.call(toString(attrName));
        if (hasOwnProperty.call(this.#attrs, normalizedName)) {
            return this.#attrs[normalizedName];
        }
        return null;
    }

    hasAttribute(attrName: string): boolean {
        const normalizedName = StringToLowerCase.call(toString(attrName));
        return hasOwnProperty.call(this.#attrs, normalizedName);
    }

    removeAttribute(attrName: string): void {
        const normalizedName = StringToLowerCase.call(toString(attrName));
        delete this.#attrs[normalizedName];
        // Track mutations for removal of non-existing attributes
        mutationTracker.add(this, normalizedName);
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

    get template() {
        return {
            synthetic: false,
        };
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

    shadowRoot?: ShadowRoot | null;

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

    // ARIA properties
    ariaActiveDescendant!: string | null;
    ariaAtomic!: string | null;
    ariaAutoComplete!: string | null;
    ariaBusy!: string | null;
    ariaChecked!: string | null;
    ariaColCount!: string | null;
    ariaColIndex!: string | null;
    ariaColIndexText!: string | null;
    ariaColSpan!: string | null;
    ariaControls!: string | null;
    ariaCurrent!: string | null;
    ariaDescribedBy!: string | null;
    ariaDescription!: string | null;
    ariaDetails!: string | null;
    ariaDisabled!: string | null;
    ariaErrorMessage!: string | null;
    ariaExpanded!: string | null;
    ariaFlowTo!: string | null;
    ariaHasPopup!: string | null;
    ariaHidden!: string | null;
    ariaInvalid!: string | null;
    ariaKeyShortcuts!: string | null;
    ariaLabel!: string | null;
    ariaLabelledBy!: string | null;
    ariaLevel!: string | null;
    ariaLive!: string | null;
    ariaModal!: string | null;
    ariaMultiLine!: string | null;
    ariaMultiSelectable!: string | null;
    ariaOrientation!: string | null;
    ariaOwns!: string | null;
    ariaPlaceholder!: string | null;
    ariaPosInSet!: string | null;
    ariaPressed!: string | null;
    ariaReadOnly!: string | null;
    ariaRelevant!: string | null;
    ariaRequired!: string | null;
    ariaRoleDescription!: string | null;
    ariaRowCount!: string | null;
    ariaRowIndex!: string | null;
    ariaRowIndexText!: string | null;
    ariaRowSpan!: string | null;
    ariaSelected!: string | null;
    ariaSetSize!: string | null;
    ariaSort!: string | null;
    ariaValueMax!: string | null;
    ariaValueMin!: string | null;
    ariaValueNow!: string | null;
    ariaValueText!: string | null;
    ariaBrailleLabel!: string | null;
    ariaBrailleRoleDescription!: string | null;
    role!: string | null;
}

defineProperties(LightningElement.prototype, reflectionDescriptors);
