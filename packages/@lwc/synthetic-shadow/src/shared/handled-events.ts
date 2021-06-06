/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const currentlyHandledEvents: Set<Event> = new Set();

export function startHandledByWrappedListener(event: Event) {
    currentlyHandledEvents.add(event);
}

export function endHandledByWrappedListener(event: Event) {
    currentlyHandledEvents.delete(event);
}

export function isBeingHandledByWrappedListener(event: Event) {
    return currentlyHandledEvents.has(event);
}
