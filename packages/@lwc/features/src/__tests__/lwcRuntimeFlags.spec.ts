/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { describe, it, expect } from 'vitest';
import { lwcRuntimeFlags } from '../index';

describe('lwcRuntimeFlags', () => {
    it('known flags default to undefined', () => {
        expect(lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG).toBeUndefined();
    });

    it('unknown flags default to undefined', () => {
        // @ts-expect-error Explicitly testing JS behavior that violates TS types
        expect(lwcRuntimeFlags.DOES_NOT_EXIST).toBeUndefined();
    });
});
