/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This file contains basic decorator usage and is tested with `experimentalDecorators` set to both
 * `true` and `false`, to validate that the method signatures work in both cases.
 */

import { WireAdapter } from '@lwc/engine-core';
import { LightningElement, WireAdapterConstructor, api, track, wire } from 'lwc';

type WireConfig = { config: 'config' };
type WireValue = { value: 'value' };
type WireContext = { context: 'context' };

const FakeWireAdapter = class FakeWireAdapter implements WireAdapter<WireConfig, WireContext> {
    constructor(private cb: (value: WireValue) => void) {}
    update(_cfg: WireConfig, _ctx: WireContext) {}
    connect() {}
    disconnect() {}
} satisfies WireAdapterConstructor<WireConfig, WireValue, WireContext>;

export default class extends LightningElement {
    // Valid cases
    @api apiProp?: string;
    @track trackedProp?: Record<string, unknown>;
    @wire(FakeWireAdapter, { config: 'config' }) validWireProp!: WireValue;
    @wire(FakeWireAdapter) validWireMethod(_value: WireValue) {}

    // Invalid cases
    // @ts-expect-error prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wireWrongPropType!: 'wrong type';
    // @ts-expect-error config type is `{wrong: string}` but the adapter needs `WireConfig`
    @wire(FakeWireAdapter, { wrong: 'type' }) wireWrongConfig!: WireValue;
    // @ts-expect-error prop type is `string` but the adapter needs `WireValue`
    @wire(FakeWireAdapter, { config: 'config' }) wireWrongMethodSignature(_value: 'wrong type') {}
}
