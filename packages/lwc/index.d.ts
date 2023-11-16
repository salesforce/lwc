/*
 * Copyright (c) 2023, salesforce.com, inc.
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
        attachInternals(): ElementInternals;
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
        ariaColIndexText: string | null;
        ariaDescription: string | null;
        ariaDetails: string | null;
        ariaErrorMessage: string | null;
        ariaKeyShortcuts: string | null;
        ariaModal: string | null;
        ariaPlaceholder: string | null;
        ariaRoleDescription: string | null;
        ariaRowCount: string | null;
        ariaRowIndex: string | null;
        ariaRowIndexText: string | null;
        ariaRowSpan: string | null;
        ariaColSpan: string | null;
        ariaBrailleLabel: string | null;
        ariaBrailleRoleDescription: string | null;
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
        readonly refs: { [key: string]: Element | LightningElement };
    }

    /**
     * Decorator to mark public reactive properties
     */
    export const api: PropertyDecorator;

    /**
     * Decorator to mark private reactive properties
     */
    export const track: PropertyDecorator;

    type StringKeyedRecord = Record<string, any>;
    /**
     * Decorator factory to wire a property or method to a wire adapter data source
     * Use generic types to allow type checking for wire adapters
     * Default all the generic types to any to maintain backward compatibility
     *
     * For example, a wire adapter 'getRecord' can have the following type definition
     *
     * export const getRecord: WireAdapterConstructor<GetRecordConfig, RecordRepresentation>;
     *
     * in which 'GetRecordConfig' is the adapter config object type and 'RecordRepresentation'
     * is the returned value.
     *
     * @param adapter the adapter used to provision data
     * @param config configuration object for the adapter
     */
    export function wire<
        Config extends StringKeyedRecord,
        Value,
        Context extends StringKeyedRecord = StringKeyedRecord
    >(
        adapter:
            | WireAdapterConstructor<Config, Value, Context>
            | LegacyWireAdapterConstructor<Config, Value>,
        config?: WireConfigValue<Config>
    ): PropertyDecorator;

    type LegacyWireAdapterConstructor<Config, Value> = (config?: Config) => Value;
    type WireConfigValue<Config extends StringKeyedRecord = StringKeyedRecord> = {
        // wire reactive variables are strings prefixed with '$' so the config value can just be string
        [K in keyof Config]: Config[K] | string;
    };
    type ContextValue<Context extends StringKeyedRecord = StringKeyedRecord> = Context;

    interface WireAdapter<Config extends StringKeyedRecord, Context extends StringKeyedRecord> {
        update(config: WireConfigValue<Config>, context?: ContextValue<Context>): void;
        connect(): void;
        disconnect(): void;
    }

    type WireDataCallback<Value> = (value: Value) => void;
    type WireAdapterSchemaValue = 'optional' | 'required';

    interface ContextConsumer<Context extends StringKeyedRecord> {
        provide(newContext: ContextValue<Context>): void;
    }

    interface ContextProviderOptions<Context extends StringKeyedRecord> {
        consumerConnectedCallback: (consumer: ContextConsumer<Context>) => void;
        consumerDisconnectedCallback?: (consumer: ContextConsumer<Context>) => void;
    }

    interface WireAdapterConstructor<
        Config extends StringKeyedRecord,
        Value,
        Context extends StringKeyedRecord
    > {
        new (callback: WireDataCallback<Value>): WireAdapter<Config, Context>;
        configSchema?: Record<keyof Config, WireAdapterSchemaValue>;
        contextSchema?: Record<keyof Context, WireAdapterSchemaValue>;
    }

    type Contextualizer<Context extends StringKeyedRecord> = (
        elm: EventTarget,
        options: ContextProviderOptions<Context>
    ) => void;
    export function createContextProvider<
        Config extends StringKeyedRecord,
        Value,
        Context extends StringKeyedRecord = StringKeyedRecord
    >(config: WireAdapterConstructor<Config, Value, Context>): Contextualizer<Context>;
}
