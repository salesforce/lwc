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

const config: WireConfig = { config: 'config' };

// `class C implements A` validates that the class instance matches type A
// `const C = class C {} satisfies B` validates that the class constructor matches type B
const FakeWireAdapter = class FakeWireAdapter implements WireAdapter<WireConfig, WireContext> {
    constructor(private cb: (value: WireValue) => void) {}
    update(_cfg: WireConfig, _ctx: WireContext) {}
    connect() {}
    disconnect() {}
} satisfies WireAdapterConstructor<WireConfig, WireValue, WireContext>;

// @ts-expect-error bare decorator cannot be used
wire(FakeWireAdapter, { config: 'config' })();

export default class Decorators extends LightningElement {
    plainProp = 'config' as const;
    otherProp = 123;
    nested = { object: 'config' as const };

    // Valid cases -- prop
    @wire(FakeWireAdapter, { config: 'config' }) baseConfigProp?: WireValue;
    @wire(FakeWireAdapter, config) configVarProp?: WireValue;
    @wire(FakeWireAdapter, { config: '$plainProp' }) reactiveConfigProp?: WireValue;
    @wire(FakeWireAdapter, { config: '$nested.object' }) nestedReactiveConfigProp?: WireValue;
    @wire(FakeWireAdapter, { config: 'config' } as const) baseConstConfigProp?: WireValue;
    @wire(FakeWireAdapter, { config: '$plainProp' } as const)
    reactiveConstConfigProp?: WireValue;
    @wire(FakeWireAdapter, { config: '$nested.object' } as const)
    nestedReactiveConstConfigProp?: WireValue;

    // Valid cases -- method
    @wire(FakeWireAdapter, { config: 'config' }) baseConfigMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, config) configVarMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, { config: '$plainProp' }) reactiveConfigMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, { config: '$nested.object' })
    nestedReactiveConfigMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, { config: 'config' } as const) baseConstConfigMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, { config: '$plainProp' } as const)
    reactiveConstConfigMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, { config: '$nested.object' } as const)
    nestedReactiveConstConfigMethod(_?: WireValue) {}
    @wire(FakeWireAdapter, { config: 'config' }) emptyMethod() {}

    // Invalid cases -- prop
    // @ts-expect-error prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wrongPropType?: 'wrong type';
    // @ts-expect-error config type is `{wrong: string}` but the adapter needs `WireConfig`
    @wire(FakeWireAdapter, { wrong: 'type' }) wrongConfigProp?: WireValue;
    // @ts-expect-error prop must be initialized or set as optional
    @wire(FakeWireAdapter, { config: 'config' }) nonUndefinedProp: WireValue;
    // @ts-expect-error `wrongProp` is not a valid reactive prop
    @wire(FakeWireAdapter, { config: '$wrongProp' } as const) wrongReactiveProp?: WireValue;
    // @ts-expect-error `nested.wrong` is not a valid reactive prop
    @wire(FakeWireAdapter, { config: '$nested.wrong' } as const)
    wrongNestedReactiveProp?: WireValue;
    // @ts-expect-error `otherProp` is the wrong type
    @wire(FakeWireAdapter, { config: '$otherProp' } as const) wrongReactiveProp?: WireValue;

    // Invalid cases -- method
    // @ts-expect-error prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wrongMethodSignature(_?: 'wrong type') {}
    // @ts-expect-error config type is `{wrong: string}` but the adapter needs `WireConfig`
    @wire(FakeWireAdapter, { wrong: 'type' }) wrongConfigMethod(_?: WireValue) {}
    // @ts-expect-error too many arguments
    @wire(FakeWireAdapter, { config: 'config' })
    tooManyArguments(_a: WireValue | undefined, _b: unknown): void {}

    // Ambiguous cases -- possibly shouldn't be valid?
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config if the adapter does?
    @wire(FakeWireAdapter) noConfigProp?: WireValue;
    @wire(FakeWireAdapter) noConfigMethod(_?: WireValue) {}
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
