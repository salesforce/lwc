/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { lwcRuntimeFlags, default as features } from '../flags';

describe('lwcRuntimeFlags', () => {
    it('known flags default to undefined', () => {
        expect(lwcRuntimeFlags.DUMMY_TEST_FLAG).toBeUndefined();
    });

    it('unknown flags default to undefined', () => {
        // @ts-ignore
        expect(lwcRuntimeFlags.DOES_NOT_EXIST).toBeUndefined();
    });

    it('known flags in the features map are null', () => {
        expect(features.DUMMY_TEST_FLAG).toBeNull();
        for (const value of Object.values(features)) {
            expect(value).toBeNull();
        }
    });

    it('unknown flags in the features map are undefined', () => {
        // @ts-ignore
        expect(features.DOES_NOT_EXIST).toBeUndefined();
    });
});
