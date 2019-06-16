/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Event fired by wire adapters to emit a new value.
 */
export class ValueChangedEvent {
    value: any;
    type: string;
    constructor(value) {
        this.type = 'ValueChangedEvent';
        this.value = value;
    }
}
