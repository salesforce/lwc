/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const ValueChangedEventType = 'ValueChangedEvent';

/**
 * Event fired by wire adapters to emit a new value.
 */
export class ValueChangedEvent {
    /** The new value. */
    value: any;
    type: string;
    constructor(value: any) {
        this.type = ValueChangedEventType;
        this.value = value;
    }
}
