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

/**
 * Gets the property keys that can be used in a reactive string. Excludes symbols and string props
 * with `.` (`$foo.bar` maps to `Class["foo"]["bar"]`; `Class["foo.bar"]` can never be used).
 */
type ReactivePropsOnly<K extends PropertyKey> = Exclude<K, symbol | `${string}.${string}`>;

/** The string keys of an object that match the target type. */
type PropsOfType<Class, Target> = ReactivePropsOnly<
    {
        [K in keyof Class]-?: NonNullable<Class[K]> extends Target ? K : never;
    }[keyof Class]
>;

/** Gets the property keys that can be used in a reactive property chain. */
type ChainableObjectProps<Class> = ReactivePropsOnly<
    {
        [K in keyof Class]-?: NonNullable<Class[K]> extends object
            ? keyof NonNullable<Class[K]> extends never
                ? never // object/function has no props
                : K // object has props
            : never; // not an object
    }[keyof Class]
>;

/**
 * Extends the given wire adapter config with reactive property strings (e.g. `$prop`) for values
 * on the given class that match the config. To limit the amount of noise in the resultant type
 * union, there are a number of restrictions that may result in false positives or false negatives.
 * - Only top-level props are validated. Type checking is **not** done on nested property chains.
 * - `string` values inherently permit _any_ string.
 * - Property chains are only allowed if the top-level props is an object.
 * - Property chains from `LightningElement` props are excluded.
 * A getter can be used to avoid incorrect error reporting, top-level props are always validated.
 * Alternatively, a type assertion can be used to suppress the error.
 *
 * @example
 * declare const Adapter: WireAdapterConstructor<{ id: number }>;
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
 *   // Nested props are not checked to avoid crashing on recursive types.
 *   \@wire(Adapter, { id: "$objectProp.nestedStringProp" }) falsePositive?: unknown;
 *
 *   get propertyChainWorkaround(): string {
 *     return this.objectProp.nestedStringProp;
 *   }
 *
 *   // Correctly type-checked and reports an error
 *   \@wire(Adapter, { id: "$propertyChainWorkaround" }) invalidGetter?: unknown;
 *
 *   // Any non-nullish value can have properties accessed at runtime, but property access
 *   // for non-objects is uncommon, so is excluded for simplicity.
 *   \@wire(Adapter, { id: "$stringProp.length" }) falseNegativeString?: unknown;
 *
 *   // Using props inherited from `LightningElement` for property chains is uncommon,
 *   // so they are excluded for simplicity.
 *   \@wire(Adapter, { id: "$children.length" }) falseNegativeLightningElement?: unknown;
 *
 *   //
 *   \@wire(Adapter, { id: "$children.length" as unknown as Component["children"]["length"] }) falseNegativeLightningElement?: unknown;
 * }
 */
export type ConfigWithReactiveProps<Config extends ConfigValue, Class> = {
    [K in keyof Config]:
        | Config[K] // The actual value, e.g. `number`
        // Props on the class that match the config value, e.g. `$numberProp`
        | `$${PropsOfType<Class, Config[K]>}`
        // A nested prop on the class that matches the config value, e.g. `$obj.num` or `$1.2.3`
        | `$${ChainableObjectProps<Class>}.${string}`;
};
