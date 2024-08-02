/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { WireAdapter } from '@lwc/engine-core';
import { LightningElement, WireAdapterConstructor, wire } from 'lwc';

type WireConfig = { config: 'config' };
type WireValue = { value: 'value' };
type WireContext = { context: 'context' };
type DeepConfig = { deep: { config: number } };

const config: WireConfig = { config: 'config' };

// `class C implements A` validates that the class instance matches type A
// `const C = class C {} satisfies B` validates that the class constructor matches type B
const FakeWireAdapter = class FakeWireAdapter implements WireAdapter<WireConfig, WireContext> {
    constructor(private cb: (value: WireValue) => void) {}
    update(_cfg: WireConfig, _ctx: WireContext) {}
    connect() {}
    disconnect() {}
} satisfies WireAdapterConstructor<WireConfig, WireValue, WireContext>;

const DeepConfigAdapter = class DeepConfigAdapter implements WireAdapter<DeepConfig, WireContext> {
    constructor(private cb: (value: WireValue) => void) {}
    update(_cfg: DeepConfig) {}
    connect() {}
    disconnect() {}
} satisfies WireAdapterConstructor<DeepConfig, WireValue>;

// @ts-expect-error bare decorator cannot be used
wire(FakeWireAdapter, { config: 'config' })();

// @ts-expect-error decorator cannot be used on classes
@wire(FakeWireAdapter, { config: 'config' })
export class InvalidDecoratorContexts extends LightningElement {
    // @ts-expect-error decorator cannot be used on getters
    @wire(FakeWireAdapter, { config: 'config' })
    get getter(): WireValue {
        return { value: 'value' };
    }

    // @ts-expect-error decorator cannot be used on setters
    @wire(FakeWireAdapter, { config: 'config' })
    set setter(v: WireValue) {}
}

/** Validations for decorated properties */
export class PropDecorators extends LightningElement {
    plainProp = 'config' as const;
    otherProp = 123;
    nested = { object: 'config' as const };

    // Valid cases
    @wire(FakeWireAdapter, { config: 'config' }) basicConfig?: WireValue;
    @wire(FakeWireAdapter, config) configAsVar?: WireValue;
    @wire(FakeWireAdapter, { config: '$plainProp' }) reactiveConfig?: WireValue;
    @wire(FakeWireAdapter, { config: '$nested.object' }) nestedReactiveConfig?: WireValue;
    @wire(FakeWireAdapter, { config: 'config' } as const) basicConstConfig?: WireValue;
    @wire(FakeWireAdapter, { config: '$plainProp' } as const) reactiveConstConfig?: WireValue;
    @wire(FakeWireAdapter, { config: '$nested.object' } as const)
    nestedReactiveConstConfig?: WireValue;
    @wire(DeepConfigAdapter, { deep: { config: 123 } }) deepObjectConfig: any;

    // Invalid cases
    // @ts-expect-error prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wrongPropType?: 'wrong type';
    // @ts-expect-error config type is `{wrong: string}` but the adapter needs `WireConfig`
    @wire(FakeWireAdapter, { wrong: 'type' }) wrongConfigType?: WireValue;
    // @ts-expect-error prop must be initialized or set as optional
    @wire(FakeWireAdapter, { config: 'config' }) nonUndefinedProp: WireValue;
    // @ts-expect-error `wrongProp` is not a valid reactive prop
    @wire(FakeWireAdapter, { config: '$wrongProp' } as const) nonexistentReactiveProp?: WireValue;
    // @ts-expect-error `nested.wrong` is not a valid reactive prop
    @wire(FakeWireAdapter, { config: '$nested.wrong' } as const)
    wrongNestedReactiveProp?: WireValue;
    // @ts-expect-error `otherProp` is the wrong type
    @wire(FakeWireAdapter, { config: '$otherProp' } as const) wrongReactivePropType?: WireValue;
    // @ts-expect-error nested props are not reactive
    @wire(DeepConfigAdapter, { deep: { config: '$otherProp' } })
    nonReactiveDeepObjectConfig?: WireValue;

    // Ambiguous case: Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config if the adapter does?
    @wire(FakeWireAdapter) noConfigProp?: WireValue;
}

/** Validations for decorated methods */
export class MethodDecorators extends LightningElement {
    plainProp = 'config' as const;
    otherProp = 123;
    nested = { object: 'config' as const };
    // Valid cases
    @wire(FakeWireAdapter, { config: 'config' }) baseConfig(_: WireValue) {}
    @wire(FakeWireAdapter, { config: 'config' }) optionalParam(_?: WireValue) {}
    @wire(FakeWireAdapter, config) configAsVar(_: WireValue) {}
    @wire(FakeWireAdapter, { config: '$plainProp' }) reactiveConfig(_: WireValue) {}
    @wire(FakeWireAdapter, { config: '$nested.object' }) nestedReactiveConfig(_: WireValue) {}
    @wire(FakeWireAdapter, { config: 'config' } as const) baseConstConfig(_: WireValue) {}
    @wire(FakeWireAdapter, { config: '$plainProp' } as const) reactiveConstConfig(_: WireValue) {}
    @wire(FakeWireAdapter, { config: '$nested.object' } as const)
    nestedReactiveConstConfig(_: WireValue) {}
    @wire(FakeWireAdapter, { config: 'config' }) emptyMethod() {}

    // Invalid cases -- method
    // @ts-expect-error method param is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wrongMethodSignature(_: 'wrong type') {}
    // @ts-expect-error config type is `{wrong: string}` but the adapter needs `WireConfig`
    @wire(FakeWireAdapter, { wrong: 'type' }) wrongConfigType(_: WireValue) {}
    // @ts-expect-error too many arguments
    @wire(FakeWireAdapter, { config: 'config' })
    tooManyArguments(_a: WireValue | undefined, _b: unknown): void {}

    // Ambiguous case: Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config if the adapter does?
    @wire(FakeWireAdapter) noConfig(_: WireValue) {}

    // These types are inferred as `string`, so we can't do any further checking on them :\
    @wire(FakeWireAdapter, { config: '$wrongProp' }) falsePositiveReactiveProp?: WireValue;
    @wire(FakeWireAdapter, { config: '$nested.wrong' }) falsePositiveNestedReactiveProp?: WireValue;
    @wire(FakeWireAdapter, { config: '$otherProp' }) falsePositiveWrongReactiveProp?: WireValue;
}

// @ts-expect-error decorator doesn't work on non-component classes
@wire(FakeWireAdapter, { config: 'config' })
export class NonComponent {
    // @ts-expect-error decorator doesn't work on non-component classes
    @wire(FakeWireAdapter, { config: 'config' }) optionalProperty?: string;
    // @ts-expect-error decorator doesn't work on non-component classes
    @wire(FakeWireAdapter, { config: 'config' }) propertyWithDefault = true;
    // @ts-expect-error decorator doesn't work on non-component classes
    @wire(FakeWireAdapter, { config: 'config' }) nonNullAssertedProperty!: object;
    // @ts-expect-error decorator doesn't work on non-component classes
    @wire(FakeWireAdapter, { config: 'config' }) method() {}
    // @ts-expect-error decorator doesn't work on non-component classes
    @wire(FakeWireAdapter, { config: 'config' }) getter(): undefined {}
    // @ts-expect-error decorator doesn't work on non-component classes
    @wire(FakeWireAdapter, { config: 'config' }) setter(_: string) {}
}
