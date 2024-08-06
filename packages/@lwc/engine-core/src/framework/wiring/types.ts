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

/** Resolves a property chain to the corresponding value on the target type. */
type ResolveReactiveValue<Target, Keys> = Keys extends keyof Target
    ? Target[Keys]
    : Keys extends `${infer K}.${infer Rest}`
    ? K extends keyof Target
        ? ResolveReactiveValue<Target[K], Rest>
        : undefined
    : undefined;

/**
 * Detects if the `Value` type is a property chain starting with "$". If so, it resolves the
 * properties to the corresponding value on the target type.
 */
type ResolveValueIfReactive<Value, Target> = Value extends string
    ? string extends Value // `Value` is type `string`
        ? // Workaround for not being able to enforce `as const` assertions -- we don't know if this
          // is a true string value (e.g. `@wire(adapter, {val: 'str'})`) or if it's a reactive prop
          // (e.g. `@wire(adapter, {val: '$number'})`), so we have to go broad to avoid type errors.
          any
        : Value extends `$${infer Keys}` // String literal starting with "$", e.g. `$prop`
        ? ResolveReactiveValue<Target, Keys>
        : Value // String literal *not* starting with "$", e.g. `"hello world"`
    : Value; // non-string type

export type ReplaceReactiveValues<Config extends ConfigValue, Component> = {
    [K in keyof Config]: ResolveValueIfReactive<Config[K], Component>;
};
