/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// To enable access to accurate DOM types in this file, uncomment the line below and comment out the
// type stubs. This also adds DOM globals (e.g. window, document), so be careful!
// Note: It's a "triple slash directive", must be exactly /// <reference lib="dom" />
// /// <reference lib="dom" />
type DOMTokenList = object;
type HTMLElement = Record<string, unknown>;
type EventListenerOrEventListenerObject = unknown;
type AddEventListenerOptions = unknown;
type ElementInternals = unknown;
type DOMRect = unknown;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type HTMLCollectionOf<T> = unknown;
type Element = unknown;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NodeListOf<T> = unknown;
type HTMLElementEventMap = unknown;
type EventListenerOptions = unknown;
type HTMLCollection = unknown;
type ChildNode = unknown;
type Document = unknown;
type ShadowRoot = unknown;
type CSSStyleDeclaration = unknown;

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

    // Props copied from HTMLElementTheGoodParts in @lwc/engine-core
    accessKey?: string;
    children?: HTMLCollection;
    childNodes?: NodeListOf<ChildNode>;
    dir?: string;
    draggable?: boolean;
    firstChild?: ChildNode | null;
    firstElementChild?: Element | null;
    hidden?: boolean;
    id?: string;
    lang?: string;
    lastChild?: ChildNode | null;
    lastElementChild?: Element | null;
    ownerDocument?: Document;
    shadowRoot?: ShadowRoot | null;
    spellcheck?: boolean;
    tabIndex?: number;
    title?: string;
    style?: CSSStyleDeclaration;

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

    setAttribute(attrName: string, value: string): void {
        // Not sure it's correct to initialize here if missing
        if (!this.__attrs) this.__attrs = {};
        this.__attrs[attrName] = value;
    }

    removeAttribute(attrName: string): void {
        delete this.__attrs?.[attrName];
    }

    // -------------------------------------------------------------------------------- //
    // Stubs to satisfy the HTMLElementTheGoodParts (from @lwc/engine-core) interface //
    // The interface is not explicitly referenced here, so this may become outdated //
    // -------------------------------------------------------------------------- //

    addEventListener(
        _type: string,
        _listener: EventListenerOrEventListenerObject,
        _options?: boolean | AddEventListenerOptions
    ): void {
        throw new Error('Method "addEventListener" not implemented.');
    }
    attachInternals(): ElementInternals {
        throw new Error('Method "attachInternals" not implemented.');
    }
    dispatchEvent(_event: Event): boolean {
        throw new Error('Method "dispatchEvent" not implemented.');
    }
    getAttributeNS(_namespace: string | null, _localName: string): string | null {
        throw new Error('Method "getAttributeNS" not implemented.');
    }
    getBoundingClientRect(): DOMRect {
        throw new Error('Method "getBoundingClientRect" not implemented.');
    }
    getElementsByClassName(_classNames: string): HTMLCollectionOf<Element> {
        throw new Error('Method "getElementsByClassName" not implemented.');
    }
    getElementsByTagName(_qualifiedName: unknown): HTMLCollectionOf<Element> {
        throw new Error('Method "getElementsByTagName" not implemented.');
    }
    hasAttribute(_qualifiedName: string): boolean {
        throw new Error('Method "hasAttribute" not implemented.');
    }
    hasAttributeNS(_namespace: string | null, _localName: string): boolean {
        throw new Error('Method "hasAttributeNS" not implemented.');
    }
    querySelector(_selectors: string): Element | null {
        throw new Error('Method "querySelector" not implemented.');
    }
    querySelectorAll(_selectors: string): NodeListOf<Element> {
        throw new Error('Method "querySelectorAll" not implemented.');
    }
    removeAttributeNS(_namespace: string | null, _localName: string): void {
        throw new Error('Method "removeAttributeNS" not implemented.');
    }
    removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(_type: unknown, _listener: unknown, _options?: unknown): void {
        throw new Error('Method "removeEventListener" not implemented.');
    }
    setAttributeNS(_namespace: string | null, _qualifiedName: string, _value: string): void {
        throw new Error('Method "setAttributeNS" not implemented.');
    }
    toString(): string {
        throw new Error('Method "toString" not implemented.');
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
