/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { SetAdd, SetDelete, SetHas } from '@lwc/shared';
const currentlyHandledEvents: Set<Event> = new Set();

export function isBeingHandledByWrappedListener(event: Event): boolean {
    return SetHas.call(currentlyHandledEvents, event);
}

export function invokeWrappedListener(
    target: EventTarget | EventListenerObject,
    listener: EventListener,
    event: Event
): void {
    SetAdd.call(currentlyHandledEvents, event);
    try {
        listener.call(target, event);
    } finally {
        SetDelete.call(currentlyHandledEvents, event);
    }
}
