/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { describe, it, expect } from 'vitest';
import features from '../index';

describe('features', () => {
    it('known flags in the features map are null', () => {
        expect(features.PLACEHOLDER_TEST_FLAG).toBeNull();
        for (const value of Object.values(features)) {
            expect(value).toBeNull();
        }
    });

    it('unknown flags in the features map are undefined', () => {
        // @ts-expect-error explicitly testing JS behavior that violates TS types
        expect(features.DOES_NOT_EXIST).toBeUndefined();
    });
});
