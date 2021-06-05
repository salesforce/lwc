/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const retargetableEvents: Set<Event> = new Set();

export function enableRetargeting(event: Event) {
    retargetableEvents.add(event);
}

export function disableRetargeting(event: Event) {
    retargetableEvents.delete(event);
}

export function isRetargetable(event: Event) {
    return retargetableEvents.has(event);
}
