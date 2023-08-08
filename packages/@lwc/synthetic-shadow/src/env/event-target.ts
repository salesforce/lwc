/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export const eventTargetPrototype = EventTarget.prototype;

const { addEventListener, dispatchEvent, removeEventListener } = eventTargetPrototype;

export { addEventListener, dispatchEvent, removeEventListener };
