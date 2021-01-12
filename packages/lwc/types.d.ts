/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Lightning Web Components core module
 */

declare module 'lwc' {
    // backwards compatible type used for the old days when TS didn't support `event.composed`
    interface ComposableEvent extends Event {
        composed: boolean;
    }

    class HTMLElementTheGoodPart {
        dispatchEvent(evt: Event): boolean;
        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;
        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
        setAttributeNS(ns: string, attrName: string, value: any): void;
        removeAttributeNS(ns: string, attrName: string): void;
        removeAttribute(attrName: string): void;
        setAttribute(attrName: string, value: any): void;
        getAttribute(attrName: string): string | null;
        getAttributeNS(ns: string, attrName: string): string | null;
        getBoundingClientRect(): ClientRect;
        querySelector<E extends Element = Element>(selectors: string): E | null;
        querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
        getElementsByTagName(tagNameOrWildCard: string): HTMLCollectionOf<Element>;
        getElementsByClassName(names: string): HTMLCollectionOf<Element>;
        readonly tagName: string;
        readonly classList: DOMTokenList;

        // Default HTML Properties
        dir: string;
        id: string;
        accessKey: string;
        title: string;
        lang: string;
        hidden: boolean;
        draggable: boolean;
        tabIndex: number;

        // Aria Properties
        ariaAutoComplete: string | null;
        ariaChecked: string | null;
        ariaCurrent: string | null;
        ariaDisabled: string | null;
        ariaExpanded: string | null;
        ariaHasPopup: string | null;
        ariaHidden: string | null;
        ariaInvalid: string | null;
        ariaLabel: string | null;
        ariaLevel: string | null;
        ariaMultiLine: string | null;
        ariaMultiSelectable: string | null;
        ariaOrientation: string | null;
        ariaPressed: string | null;
        ariaReadOnly: string | null;
        ariaRequired: string | null;
        ariaSelected: string | null;
        ariaSort: string | null;
        ariaValueMax: string | null;
        ariaValueMin: string | null;
        ariaValueNow: string | null;
        ariaValueText: string | null;
        ariaLive: string | null;
        ariaRelevant: string | null;
        ariaAtomic: string | null;
        ariaBusy: string | null;
        ariaActiveDescendant: string | null;
        ariaControls: string | null;
        ariaDescribedBy: string | null;
        ariaFlowTo: string | null;
        ariaLabelledBy: string | null;
        ariaOwns: string | null;
        ariaPosInSet: string | null;
        ariaSetSize: string | null;
        ariaColCount: string | null;
        ariaColIndex: string | null;
        ariaDetails: string | null;
        ariaErrorMessage: string | null;
        ariaKeyShortcuts: string | null;
        ariaModal: string | null;
        ariaPlaceholder: string | null;
        ariaRoleDescription: string | null;
        ariaRowCount: string | null;
        ariaRowIndex: string | null;
        ariaRowSpan: string | null;
        ariaColSpan: string | null;
        role: string | null;
    }

    // @ts-ignore type-mismatch
    interface ShadowRootTheGoodPart extends NodeSelector {
        mode: string;
        readonly activeElement: Element | null;
        readonly host: HTMLElement;
        readonly firstChild: Node | null;
        readonly lastChild: Node | null;
        readonly innerHTML: string;
        readonly textContent: string;
        readonly childNodes: Node[];
        readonly delegatesFocus: boolean;
        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;
        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
        hasChildNodes(): boolean;
        compareDocumentPosition(otherNode: Node): number;
        contains(otherNode: Node): boolean;
        elementFromPoint(x: number, y: number): Element | null;
        querySelector<K extends keyof HTMLElementTagNameMap>(
            selectors: K
        ): HTMLElementTagNameMap[K] | null;
        querySelector<K extends keyof SVGElementTagNameMap>(
            selectors: K
        ): SVGElementTagNameMap[K] | null;
        querySelector<E extends Element = Element>(selectors: string): E | null;
        querySelectorAll<K extends keyof HTMLElementTagNameMap>(
            selectors: K
        ): NodeListOf<HTMLElementTagNameMap[K]>;
        querySelectorAll<K extends keyof SVGElementTagNameMap>(
            selectors: K
        ): NodeListOf<SVGElementTagNameMap[K]>;
        querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    }

    /**
     * Base class for the Lightning Web Component JavaScript class
     */
    export class LightningElement extends HTMLElementTheGoodPart {
        /**
         * This static getter builds a Web Component class from a LWC constructor so it can be registered
         * as a new element via customElements.define() at any given time. For example:
         *
         * ```
         * import XComponent from 'namespace/element';
         * customElements.define('x-component', XComponent.CustomElementConstructor);
         * const elm = document.createElement('x-component');
         * ```
         */
        static get CustomElementConstructor(): typeof HTMLElement;
        /**
         * Called when the element is inserted in a document
         */
        connectedCallback(): void;
        /**
         * Called when the element is removed from a document
         */
        disconnectedCallback(): void;
        /**
         * Called after every render of the component
         */
        renderedCallback(): void;
        /**
         * Called when a descendant component throws an error in one of its lifecycle hooks
         */
        errorCallback(error: Error, stack: string): void;

        readonly template: ShadowRootTheGoodPart;
        readonly shadowRoot: null;
    }

    /**
     * Decorator to mark public reactive properties
     */
    export const api: PropertyDecorator;

    /**
     * Decorator to mark private reactive properties
     */
    export const track: PropertyDecorator;

    /**
     * Decorator factory to wire a property or method to a wire adapter data source
     * @param adapter the adapter used to provision data
     * @param config configuration object for the adapter
     */
    export function wire(
        adapter: WireAdapterConstructor | LegacyWireAdapterConstructor,
        config?: WireConfigValue
    ): PropertyDecorator;

    type LegacyWireAdapterConstructor = (config?: any) => any;
    type WireConfigValue = Record<string, any>;
    type ContextValue = Record<string, any>;

    interface WireAdapter {
        update(config: WireConfigValue, context?: ContextValue): void;
        connect(): void;
        disconnect(): void;
    }

    type WireDataCallback = (value: any) => void;
    type WireAdapterSchemaValue = 'optional' | 'required';

    interface ContextConsumer {
        provide(newContext: ContextValue): void;
    }

    interface ContextProviderOptions {
        consumerConnectedCallback: (consumer: ContextConsumer) => void;
        consumerDisconnectedCallback?: (consumer: ContextConsumer) => void;
    }

    interface WireAdapterConstructor {
        new (callback: WireDataCallback): WireAdapter;
        configSchema?: Record<string, WireAdapterSchemaValue>;
        contextSchema?: Record<string, WireAdapterSchemaValue>;
    }

    type Contextualizer = (elm: EventTarget, options: ContextProviderOptions) => void;
    export function createContextProvider(config: WireAdapterConstructor): Contextualizer;
}
