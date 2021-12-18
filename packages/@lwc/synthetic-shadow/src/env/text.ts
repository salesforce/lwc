/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { hasOwnProperty, getOwnPropertyDescriptor } from '@lwc/shared';

export const assignedSlotGetter: (this: Text) => HTMLSlotElement | null = hasOwnProperty.call(
    Text.prototype,
    'assignedSlot'
)
    ? getOwnPropertyDescriptor(Text.prototype, 'assignedSlot')!.get!
    : () => null;
