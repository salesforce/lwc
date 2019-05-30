/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { defineProperties } from '../shared/language';
import { assignedSlotGetterPatched } from './slot';

// Non-deep-traversing patches
defineProperties(Text.prototype, {
    assignedSlot: {
        get: assignedSlotGetterPatched,
        enumerable: true,
        configurable: true,
    },
});
