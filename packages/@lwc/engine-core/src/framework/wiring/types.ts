/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import type { LightningElement } from '../base-lightning-element';
import type { HostElement } from '../renderer';

export type DataCallback<T = any> = (value: T) => void;
export type ConfigValue = Record<string, any>;
export type WireAdapterSchemaValue = 'optional' | 'required';
export type ContextValue = Record<string, any>;

export interface WireAdapter<
    Config extends ConfigValue = ConfigValue,
    Context extends ContextValue = ContextValue
> {
    update(config: Config, context?: Context): void;
    connect(): void;
    disconnect(): void;
}

export interface WireAdapterConstructor<
    Config extends ConfigValue = ConfigValue,
    Value = any,
    Context extends ContextValue = ContextValue
> {
    new (callback: DataCallback<Value>, sourceContext?: { tagName: string }): WireAdapter<
        Config,
        Context
    >;
    configSchema?: Record<keyof Config, WireAdapterSchemaValue>;
    contextSchema?: Record<keyof Context, WireAdapterSchemaValue>;
}

/**
 * The decorator returned by `@wire()`; not the `wire` factory function.
 *
 * If you're using `@wire(adapter) property` and getting an opaque type error, ensure that the
 * property is explicitly typed and the type matches the value used by the adapter. Note that one
 * of the following conditions must always be true:
 * - The adapter uses `undefined` as a possible value
 * - The property is marked as optional
 * - The property is assigned a default value (not recommended)
 */
export interface WireDecorator<Value = any> {
    // For modern decorators, we get the property value as part of the decorator signature,
    // so we can directly compare that value with the generic `Value` from the interface.
    // We also use a generic with a constraint to ensure that we only decorate LightningElements.
    /** Property decorator for `"experimentalDecorators": false`. */
    <Class extends LightningElement>(
        target: undefined,
        ctx: ClassFieldDecoratorContext<Class, Value>
    ): void;
    /** Method decorator for `"experimentalDecorators": false`. */
    <Class extends LightningElement>(
        target: DataCallback<Value>,
        ctx: ClassMethodDecoratorContext<Class, DataCallback<Value>>
    ): void | DataCallback<Value>;
}

export interface WireDef {
    method?: (data: any) => void;
    adapter: WireAdapterConstructor;
    dynamic: string[];
    configCallback: ConfigCallback;
}

export interface WireMethodDef extends WireDef {
    method: (data: any) => void;
}

export interface WireFieldDef extends WireDef {
    method?: undefined;
}

export type ConfigCallback = (component: LightningElement) => ConfigValue;

export interface WireDebugInfo {
    data?: any;
    config?: ConfigValue;
    context?: ContextValue;
    wasDataProvisionedForConfig: boolean;
}

export type WireContextSubscriptionCallback = (
    subscriptionPayload: WireContextSubscriptionPayload
) => void;

export interface WireContextSubscriptionPayload {
    setNewContext(newContext: ContextValue): void;
    setDisconnectedCallback(disconnectCallback: () => void): void;
}

export interface ContextConsumer {
    provide(newContext: ContextValue): void;
}

export interface ContextProviderOptions {
    consumerConnectedCallback: (consumer: ContextConsumer) => void;
    consumerDisconnectedCallback?: (consumer: ContextConsumer) => void;
}

export type ContextProvider = (
    elmOrComponent: EventTarget,
    options: ContextProviderOptions
) => void;

export type RegisterContextProviderFn = (
    element: HostElement,
    adapterContextToken: string,
    onContextSubscription: WireContextSubscriptionCallback
) => void;

/**
 * String values starting with "$" are reactive; they get replaced by values from the component.
 * We don't have access to the component, and we don't expect all reactive strings to be typed as
 * literals, so we just replace all strings with `any`.
 */
export type ReplaceReactiveValues<T> = {
    [K in keyof T]: T[K] extends string ? any : T[K];
};
