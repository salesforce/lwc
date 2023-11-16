/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { lwcRuntimeFlags } from '../index';

describe('lwcRuntimeFlags', () => {
    it('known flags default to undefined', () => {
        expect(lwcRuntimeFlags.PLACEHOLDER_TEST_FLAG).toBeUndefined();
    });

    it('unknown flags default to undefined', () => {
        // @ts-ignore
        expect(lwcRuntimeFlags.DOES_NOT_EXIST).toBeUndefined();
    });
});
