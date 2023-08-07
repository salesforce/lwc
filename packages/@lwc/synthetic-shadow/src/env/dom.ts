/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, hasOwnProperty } from '@lwc/shared';

const eventTargetGetter: (this: Event) => EventTarget = getOwnPropertyDescriptor(
    Event.prototype,
    'target'
)!.get!;

const eventCurrentTargetGetter: (this: Event) => EventTarget | null = getOwnPropertyDescriptor(
    Event.prototype,
    'currentTarget'
)!.get!;

const focusEventRelatedTargetGetter: (this: FocusEvent) => EventTarget | null =
    getOwnPropertyDescriptor(FocusEvent.prototype, 'relatedTarget')!.get!;

// IE does not implement composedPath() but that's ok because we only use this instead of our
// composedPath() polyfill when dealing with native shadow DOM components in mixed mode. Defaulting
// to a NOOP just to be safe, even though this is almost guaranteed to be defined such a scenario.
const composedPath: () => EventTarget[] = hasOwnProperty.call(Event.prototype, 'composedPath')
    ? Event.prototype.composedPath
    : () => [];

export { composedPath, eventTargetGetter, eventCurrentTargetGetter, focusEventRelatedTargetGetter };
