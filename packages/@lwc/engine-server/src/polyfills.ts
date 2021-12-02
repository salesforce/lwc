/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { defineProperty, globalThis } from '@lwc/shared';

/**
 * The following constructor might be used in either the constructor or the connectedCallback. In
 * order to ensure that the component evaluates, we attach those mock constructors to the global
 * object.
 */
if (typeof Event !== 'function') {
    class Event {}

    defineProperty(globalThis, 'Event', {
        value: Event,
        configurable: true,
        writable: true,
    });
}
if (typeof CustomEvent !== 'function') {
    class CustomEvent extends Event {}

    defineProperty(globalThis, 'CustomEvent', {
        value: CustomEvent,
        configurable: true,
        writable: true,
    });
}
