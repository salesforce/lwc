/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

const eventToContextMap: WeakMap<Event, EventListenerContext> = new WeakMap();

export enum EventListenerContext {
    UNKNOWN_LISTENER = 0,
    CUSTOM_ELEMENT_LISTENER = 1,
    SHADOW_ROOT_LISTENER = 2,
}

export function setEventContext(evt: Event, context: EventListenerContext) {
    eventToContextMap.set(evt, context);
}

export function getEventContext(evt: Event): EventListenerContext {
    const context = eventToContextMap.get(evt);
    return isUndefined(context) ? EventListenerContext.UNKNOWN_LISTENER : context;
}
