/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

const eventToContextMap: WeakMap<Event, EventListenerContext> = new WeakMap();

export enum EventListenerContext {
    UNKNOWN_LISTENER,
    CUSTOM_ELEMENT_LISTENER,
    SHADOW_ROOT_LISTENER,
}

export function setEventContext(event: Event, context: EventListenerContext) {
    eventToContextMap.set(event, context);
}

export function getEventContext(event: Event): EventListenerContext {
    const context = eventToContextMap.get(event);
    return isUndefined(context) ? EventListenerContext.UNKNOWN_LISTENER : context;
}
