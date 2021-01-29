/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '@lwc/shared';

const eventTargetGetter: (this: Event) => EventTarget = getOwnPropertyDescriptor(
    Event.prototype,
    'target'
)!.get!;

const eventCurrentTargetGetter: (this: Event) => EventTarget | null = getOwnPropertyDescriptor(
    Event.prototype,
    'currentTarget'
)!.get!;

const focusEventRelatedTargetGetter: (
    this: FocusEvent
) => EventTarget | null = getOwnPropertyDescriptor(FocusEvent.prototype, 'relatedTarget')!.get!;

// TODO [#000]: composedPath is not present in IE11, guard against this being absent
const { composedPath } = Event.prototype;

export { composedPath, eventTargetGetter, eventCurrentTargetGetter, focusEventRelatedTargetGetter };
