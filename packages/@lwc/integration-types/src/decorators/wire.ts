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

    // Valid cases
    @wire(FakeWireAdapter, { config: 'config' }) baseConfigProp!: WireValue;
    @wire(FakeWireAdapter, { config: '$plainProp' }) reactiveConfigProp!: WireValue;
    @wire(FakeWireAdapter, { config: 'config' } as const) baseConstConfigProp!: WireValue;
    @wire(FakeWireAdapter, { config: '$plainProp' } as const)
    reactiveConstConfigProp!: WireValue;
    // Possibly shouldn't be valid?
    @wire(FakeWireAdapter) noConfigProp!: WireValue;
    @wire(FakeWireAdapter, { config: 'config' }) baseConfigMethod(_: WireValue) {}
    @wire(FakeWireAdapter, { config: '$plainProp' }) reactiveConfigMethod(_: WireValue) {}
    @wire(FakeWireAdapter, { config: 'config' } as const) baseConstConfigMethod(_: WireValue) {}
    @wire(FakeWireAdapter, { config: '$plainProp' } as const) reactiveConstConfigMethod(
        _: WireValue
    ) {}
    // Possibly shouldn't be valid?
    @wire(FakeWireAdapter) noConfigMethod(_value: WireValue) {}

    // Invalid cases
    // @ts-expect-error because prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wireWrongPropType!: 'wrong type';
    // @ts-expect-error because config type is `{wrong: string}` but the adapter needs `WireConfig`
    @wire(FakeWireAdapter, { wrong: 'type' }) wireWrongConfig!: WireValue;
    // @ts-expect-error because prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wireWrongMethodSignature(_value: 'wrong type') {}
}
