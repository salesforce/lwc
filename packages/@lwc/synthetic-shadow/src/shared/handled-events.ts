/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const currentlyHandledEvents: Set<Event> = new Set();

export function isBeingHandledByWrappedListener(event: Event): boolean {
    return currentlyHandledEvents.has(event);
}

export function invokeWrappedListener(
    target: EventTarget | EventListenerObject,
    listener: EventListener,
    event: Event
): void {
    currentlyHandledEvents.add(event);
    try {
        listener.call(target, event);
    } finally {
        currentlyHandledEvents.delete(event);
    }
}
