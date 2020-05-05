/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * The following constructor might be used in either the constructor or the connectedCallback. In
 * order to ensure that the component evaluates, we attach those mock constructors to the global
 * object.
 */

// TODO [#0]: Rename those constructors to Event and CustomEvent once we remove the "dom" library
// from the tsconfig.json
class EventGlobal {}
class CustomEventGlobal extends EventGlobal {}

Object.defineProperties(global, {
    Event: {
        value: EventGlobal,
        configurable: true,
        writable: true,
    },
    CustomEvent: {
        value: CustomEventGlobal,
        configurable: true,
        writable: true,
    },
});
