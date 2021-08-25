/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { EventTarget, Node } from './global';

export const eventTargetPrototype =
    typeof EventTarget !== 'undefined' ? EventTarget.prototype : Node.prototype;

const { addEventListener, dispatchEvent, removeEventListener } = eventTargetPrototype;

export { addEventListener, dispatchEvent, removeEventListener };
