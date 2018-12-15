/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import applyPolyfill from '../polyfill';

applyPolyfill();

describe('event-composed polyfill', () => {
    it('should compose true be default', () => {
        const clickEvent = new Event('click');
        expect(clickEvent.composed).toBe(true);
    });
});
