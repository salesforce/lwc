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

    interface ModalOpenParams {
        /**
         * Sets the modal's title and assistive device label. If the modal has a header, set label in the lightning-modal-header component. If the modal doesn't have a header, set the label property when opening the modal.
         */
        label: string;
        /**
         * Determines how much of the viewport width the modal uses. Supported values are small, medium, and large, which you can set when you open the modal. Default value is medium. The length of the modal is determined by the amount of content.
         */
        size?: 'small' | 'medium' | 'large';
        /**
         * Sets the modal's accessible description. It uses the aria-description attribute where supported, or falls back to aria-describedby. If you set a custom description value, include the label name at the beginning of your description, because some screen readers only read the description, and not the label.
         */
        description?: string;
        /**
         * Prevents closing the modal by normal means like the ESC key, the close button, or .close(). For example, you could briefly set disableClose to true while a completed form is saving, so the user doesn't dismiss the modal early. See [Use the disableClose Attribute](https://developer.salesforce.com/docs/component-library/bundle/lightning-modal/documentation#use-the-disableclose-attribute).
         */
        disableClose?: boolean;
        /**
         * To pass data from your invoking component into the modal with custom properties decorated with @api. These properties can be any type, such as a string or an object that’s an array of key/value pairs to be assigned to the new modal instance.
         */
        [key: string]: any;
    }

    /**
     * Base class for the Lightning Modal JavaScript class
     */
    export class LightningModal extends HTMLElementTheGoodPart {
        /**
         * LightningModal provides an .open() method which opens a modal and returns a promise that asynchronously resolves with the result of the user’s interaction with the modal.
         * Each invocation of a modal component’s .open() method creates a unique instance of the modal. You can think of a modal as a self-contained application that starts from scratch when it opens. It displays the content you pass in through the .open() method or that you set within the modal's HTML template.
         * When you close a modal, the modal instance is destroyed, not hidden. On close, the modal must save the user’s input data or pass it to the invoking component as the promise result. Otherwise, the data is lost when the modal instance is closed.
         * The .open() method lets you assign values to the modal's properties.
         *
         * @param param an object containing values to map to the modal's properties
         */
        static open(param: ModalOpenParams): Promise<any>;
        /**
         * close the modal, where result is anything you want to return from the modal. The .close() operation is asynchronous to display a brief fade out animation before the modal is destroyed. The result data can’t be modified after the close operation begins.
         *
         * @param param the value to resolve to the invoker on the `open` method
         */
        close(param: any): Promise<any>;
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
