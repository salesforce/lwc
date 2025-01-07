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
 * build a union of reactive property strings that would be compatible with the expected type
 *
 * exclude properties that are present on LightningElement, should help performance and avoid circular references that are inherited
 *
 * when looking for compatible types mark all optional properties as required so we can correctly evaluate their resolved types
 */
type ReactivePropertyOfComponent<Target, ExpectedType> = PrefixDollarSign<
    PropertiesOfType<Required<Omit<Target, keyof LightningElement>>, ExpectedType>
>;

/** utility type */
type PrefixDollarSign<T extends string> = `$${T}`;

/** recursively find all properties on the target that are of a compatible type, returning their paths as strings */
type PropertiesOfType<Target, ExpectedType> = {
    [K in keyof Target]: Target[K] extends ExpectedType
        ? `${Extract<K, string>}`
        : Target[K] extends object // If the value is an object, recursively check its properties
          ? PropertiesOfType<Target[K], ExpectedType> extends infer R // Check if any property in the object matches `U`
              ? R extends never
                  ? never // If no compatible keys are found, exclude the key
                  : `${Extract<K, string>}.${Extract<R, string>}` // If compatible nested keys are found, include the key
              : never
          : never;
}[keyof Target];

/** wire decorator's config can be the literal type defined or a property from component that is compatible with the expected type */
export type ConfigWithReactiveValues<Config extends ConfigValue, Comp> = {
    // allow the original config value and also any valid reactive strings
    [K in keyof Config]: Config[K] | ReactivePropertyOfCompoent<Comp, Config[K]>;
};
