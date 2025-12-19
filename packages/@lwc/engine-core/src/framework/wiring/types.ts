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
    Context extends ContextValue = ContextValue,
> {
    update(config: Config, context?: Context): void;
    connect(): void;
    disconnect(): void;
}

export interface WireAdapterConstructor<
    Config extends ConfigValue = ConfigValue,
    Value = any,
    Context extends ContextValue = ContextValue,
> {
    new (
        callback: DataCallback<Value>,
        sourceContext?: { tagName: string }
    ): WireAdapter<Config, Context>;
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

export type ShouldContinueBubbling = boolean;

export type WireContextSubscriptionCallback = (
    subscriptionPayload: WireContextSubscriptionPayload
) => ShouldContinueBubbling;

export interface WireContextSubscriptionPayload {
    setNewContext(newContext: ContextValue): ShouldContinueBubbling;
    setDisconnectedCallback?(disconnectCallback: () => void): void;
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

/** The string keys of an object */
type PropsOfType<Class, Target> = Exclude<
    {
        [K in keyof Class]: Required<Class>[K] extends Target ? K : never;
    }[keyof Class],
    symbol
>;

/**
 * Extends the given wire adapter config with reactive property strings (e.g. `$prop`) for values
 * on the given class that match the config. Only validates top-level props; does **not** provide
 * type checking for nested property access.
 *
 * @example
 * type Config = { id: number };
 * declare const Adapter: WireAdapterConstructor<Config>;
 * declare class Component extends LightningElement {
 *   numberProp = 6_7;
 *   stringProp = '🙌';
 *   objectProp?: { nestedStringProp: string };
 *   \@wire(Adapter, { id: 123 }) validValue?: unknown;
 *   \@wire(Adapter, { id: "$numberProp" }) validProp?: unknown;
 *
 *   \@wire(Adapter, { id: "bad value" }) invalidValue?: unknown;
 *   \@wire(Adapter, { id: "$stringProp" }) invalidProp?: unknown;
 *
 *   // Nested props are not checked to avoid crashing on recursive types
 *   \@wire(Adapter, { id: "$objectProp.nestedStringProp" }) falsePositive?: unknown;
 * }
 */
export type ConfigWithReactiveProps<Config extends ConfigValue, Class> = {
    [K in keyof Config]:
        | Config[K] // The actual value, e.g. `number`
        // Props on the class that match the config value, e.g. `$numberProp`
        | `$${PropsOfType<Class, Config[K]>}`
        // A nested prop on the class that matches the config value, e.g. `$obj.num` or `$1.2.3`
        | `$${PropsOfType<Class, object>}.${string}`;
};
