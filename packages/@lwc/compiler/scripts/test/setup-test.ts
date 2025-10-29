/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { expect } from 'vitest';
import { toThrowAggregateError } from './matchers/to-throw-aggregate-error';

expect.extend({
    toThrowAggregateError,
});
