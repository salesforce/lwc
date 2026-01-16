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
 * on the given class that match the config. Due to limitations of the type system, and to limit
 * the size of the resultant type union, a number of restrictions apply to this type that may
 * result in false positives or false negatives.
 * - Config values with a `string` type inherently permit _any_ string,
 *   even reactive strings that resolve to the wrong type.
 * - Only top-level props are validated. Type checking is **not** done on nested property chains.
 * - Property chains are only allowed if the top-level property is an object.
 * - Property chains from `LightningElement` props are excluded for brevity.
 *
 * For property chains, a getter can be used to avoid incorrect error reporting, as top-level props
 * are always validated. Alternatively, a type assertion can be used to suppress the error.
 *
 * @example
 * // Wire adapter with a required number prop and optional string prop
 * declare const Adapter: WireAdapterConstructor<{ num: number; str?: string }>;
 * declare class Component extends LightningElement {
 *   numberProp = 6_7;
 *   stringProp = '🙌';
 *   objectProp?: { nestedStringProp: string };
 
 *   \@wire(Adapter, { num: 123 }) validNumberValue?: unknown;
 *   \@wire(Adapter, { num: "$numberProp" }) validNumberProp?: unknown;
 *   \@wire(Adapter, { num: "bad value" }) invalidNumberValue?: unknown;
 *   \@wire(Adapter, { num: "$stringProp" }) invalidNumberProp?: unknown;
 *
 *   \@wire(Adapter, { str: "valid string", num: 0 }) validStringValue?: unknown;
 *   \@wire(Adapter, { str: "$stringProp", num: 0 }) validStringProp?: unknown;
 *   // `"$numberProp"` is a string, and therefore satisfies the type,
 *   // despite resolving to a number at runtime
 *   \@wire(Adapter, { str: "$numberProp", num: 0 }) falseNegativeString?: unknown;
 *
 *   // Nested props are not checked to avoid crashing on recursive types
 *   \@wire(Adapter, { num: "$objectProp.nestedStringProp" }) falseNegativeNested?: unknown;
 * 
 *   // Any value can have properties accessed at runtime, but property chains using
 *   // non-objects are uncommon, so they are excluded for simplicity
 *   \@wire(Adapter, { num: "$stringProp.length" }) falsePositiveString?: unknown;
 *
 *   // Using props inherited from `LightningElement` for property chains is uncommon,
 *   // so they are excluded for simplicity
 *   \@wire(Adapter, { num: "$hostElement.childElementCount" }) falsePositiveLightningElement?: unknown;
 * 
 *   get propertyChainWorkaround(): string {
 *     return this.objectProp.nestedStringProp;
 *   }
 *   // Top-level prop is type checked and correctly reports an error
 *   \@wire(Adapter, { num: "$propertyChainWorkaround" }) truePositiveGetter?: unknown;
 *   // Type assertion is used and correctly reports an error
 *   \@wire(Adapter, {
 *     num: "$objectProp.nestedStringProp" as unknown as Component["objectProp"]["nestedStringProp"]
 *   }) truePositiveTypeAssertion?: unknown;
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
