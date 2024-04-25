/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export * from '@lwc/engine-dom';

// ---------------------------------------------------------------------------------------------- //
// In the JavaScript code (./index.js), we just re-export @lwc/engine-dom. Everything below this
// line does not exist in that package. It's mostly types that aren't actually used, plus a fake
// class `HTMLElementTheGoodPart` and an additional signature for the wire decorator. Those two
// anomalies should be remedied in a major version bump. The types should probably go, too, but
// less urgently, as they're not really hurting anything.
// ---------------------------------------------------------------------------------------------- //

/**
 * Lightning Web Components core module
 */

declare module 'lwc' {
    // backwards compatible type used for the old days when TS didn't support `event.composed`
    interface ComposableEvent extends Event {
        composed: boolean;
    }

    /**
     * **DO NOT USE**: This is a former implementation detail for `LightningElement`. It is solely
     * exported as a type, and does not exist in the JavaScript code. If you think you need it, use
     * `LightningElement` instead, or the full [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
     * interface.
     * @private
     * @deprecated
     */
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

    // @ts-expect-error type-mismatch
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
     * @param adapter the adapter used to provision data
     * @param config configuration object for the adapter
     * @returns A decorator function
     * @example
     * export default class WireExample extends LightningElement {
     *   \@api bookId;
     *   \@wire(getBook, { id: '$bookId'}) book;
     * }
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
}
