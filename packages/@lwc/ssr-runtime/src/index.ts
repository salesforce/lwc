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

type DOMTokenList = object;
type EventListenerOrEventListenerObject = unknown;
type AddEventListenerOptions = unknown;
type EventListenerOptions = unknown;
type ShadowRoot = unknown;

const MULTI_SPACE = /\s+/g;

type Attributes = Record<string, string | true>;

type LightningElementConstructor = typeof LightningElement;

class ClassList implements DOMTokenList {
    el: LightningElement;

    constructor(el: LightningElement) {
        this.el = el;
    }

    add(...newClassNames: string[]) {
        const className = this.el.className;
        const set = new Set(className.split(MULTI_SPACE).filter(Boolean));
        for (const newClassName of newClassNames) {
            set.add(newClassName);
        }
        this.el.className = Array.from(set).join(' ');
    }

    contains(className: string) {
        const currentClassNameStr = this.el.className;
        return currentClassNameStr.split(MULTI_SPACE).includes(className);
    }

    remove(...classNamesToRemove: string[]) {
        const className = this.el.className;
        const set = new Set(className.split(MULTI_SPACE).filter(Boolean));
        for (const newClassName of classNamesToRemove) {
            set.delete(newClassName);
        }
        this.el.className = Array.from(set).join(' ');
    }

    replace(oldClassName: string, newClassName: string) {
        let classWasReplaced = false;
        const className = this.el.className;
        const listOfClasses = className.split(MULTI_SPACE).filter(Boolean);
        listOfClasses.forEach((value, idx) => {
            if (value === oldClassName) {
                classWasReplaced = true;
                listOfClasses[idx] = newClassName;
            }
        });
        this.el.className = listOfClasses.join(' ');
        return classWasReplaced;
    }

    toggle(classNameToToggle: string, force?: boolean) {
        const classNameStr = this.el.className;
        const set = new Set(classNameStr.split(MULTI_SPACE).filter(Boolean));
        if (!set.has(classNameToToggle) && force !== false) {
            set.add(classNameToToggle);
        } else if (set.has(classNameToToggle) && force !== true) {
            set.delete(classNameToToggle);
        }
        this.el.className = Array.from(set).join(' ');
        return set.has(classNameToToggle);
    }

    get value(): string {
        return this.el.className;
    }

    toString(): string {
        return this.el.className;
    }

    // Stubs to satisfy DOMTokenList interface
    [index: number]: never; // Can't implement arbitrary index getters without a proxy
    item(_index: number): string | null {
        throw new Error('Method "item" not implemented.');
    }
    supports(_token: string): boolean {
        throw new Error('Method "supports" not implemented.');
    }
    forEach(
        _callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
        _thisArg?: any
    ): void {
        throw new Error('Method "forEach" not implemented.');
    }
    get length(): number {
        throw new Error('Property "length" not implemented.');
    }
}

interface PropsAvailableAtConstruction {
    tagName: string;
}

export class LightningElement implements PropsAvailableAtConstruction {
    static renderMode?: 'light' | 'shadow';

    isConnected = false;
    className = '';
    // TODO [W-14977927]: protect internals from userland
    private __attrs?: Attributes;
    private __classList: ClassList | null = null;
    // Using ! because it's assigned in the constructor via `Object.assign`, which TS can't detect
    tagName!: string;

    constructor(
        propsAvailableAtConstruction: PropsAvailableAtConstruction & Record<string, unknown>
    ) {
        Object.assign(this, propsAvailableAtConstruction);
    }

    // TODO [W-14977927]: protect internals from userland
    private __internal__setState(
        props: Record<string, any>,
        reflectedProps: string[],
        attrs: Record<string, any>
    ) {
        Object.assign(this, props);
        this.__attrs = attrs;

        // Whenever a reflected prop changes, we'll update the original props object
        // that was passed in. That'll be referenced when the attrs are rendered later.
        for (const reflectedPropName of reflectedProps) {
            Object.defineProperty(this, reflectedPropName, {
                get() {
                    return props[reflectedPropName] ?? null;
                },
                set(newValue) {
                    props[reflectedPropName] = newValue;
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
            },
        });
    }

    get classList() {
        if (this.__classList) {
            return this.__classList;
        }
        return (this.__classList = new ClassList(this));
    }

    getAttribute(attrName: string): string | null {
        const value = this.__attrs?.[attrName];
        return value === true ? '' : (value ?? null);
    }

    setAttribute(attrName: string, value: string | null): void {
        // Not sure it's correct to initialize here if missing
        if (!this.__attrs) {
            this.__attrs = {};
        }

        if (value === null) {
            delete this.__attrs[attrName];
        } else {
            this.__attrs[attrName] = value;
        }
    }

    hasAttribute(attrName: string): boolean {
        return Boolean(this.__attrs && attrName in this.__attrs);
    }

    removeAttribute(attrName: string): void {
        delete this.__attrs?.[attrName];
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
        throw new TypeError('"this.hostElement" is not supported in this environment');
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

const escapeAttrVal = (attrVal: string) =>
    attrVal.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export function* renderAttrs(attrs: Attributes) {
    if (!attrs) {
        return;
    }
    for (const [key, val] of Object.entries(attrs)) {
        if (val) {
            if (typeof val === 'string') {
                yield ` ${key}="${escapeAttrVal(val)}"`;
            } else {
                yield ` ${key}`;
            }
        }
    }
}

export function* fallbackTmpl(
    _props: unknown,
    _attrs: unknown,
    _slotted: unknown,
    Cmp: LightningElementConstructor,
    _instance: unknown
) {
    if (Cmp.renderMode !== 'light') {
        yield '<template shadowrootmode="open"></template>';
    }
}

export type GenerateMarkupFn = (
    tagName: string,
    props: Record<string, any> | null,
    attrs: Attributes | null,
    slotted: Record<number | string, AsyncGenerator<string>> | null
) => AsyncGenerator<string>;

export async function serverSideRenderComponent(
    tagName: string,
    compiledGenerateMarkup: GenerateMarkupFn,
    props: Record<string, any>
): Promise<string> {
    let markup = '';

    for await (const segment of compiledGenerateMarkup(tagName, props, null, null)) {
        markup += segment;
    }

    return markup;
}
