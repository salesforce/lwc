/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '../shared/language';

const dispatchEvent =
    'EventTarget' in window ? EventTarget.prototype.dispatchEvent : Node.prototype.dispatchEvent; // IE11

const eventTargetGetter: (this: Event) => Element = getOwnPropertyDescriptor(
    Event.prototype,
    'target',
)!.get!;
const eventCurrentTargetGetter: (this: Event) => Element | null = getOwnPropertyDescriptor(
    Event.prototype,
    'currentTarget',
)!.get!;

export { dispatchEvent, eventTargetGetter, eventCurrentTargetGetter };
