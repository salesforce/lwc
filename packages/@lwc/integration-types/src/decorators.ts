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

import { LightningElement, api, track, wire } from 'lwc';

class FakeWireAdapter {
    update() {}
    connect() {}
    disconnect() {}
}

export default class extends LightningElement {
    @api apiProp?: string;
    @wire(FakeWireAdapter, {}) wireProp?: number;
    @track trackedProp?: Record<string, unknown>;
}
