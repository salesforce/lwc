/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import applyEventComposedPolyfill from '../../event-composed/polyfill';
import applyPolyfill from '../polyfill';

applyEventComposedPolyfill();
applyPolyfill();

describe('event-composed polyfill', () => {
    it('true by default', () => {
        const focusEvent = new FocusEvent('focus');
        expect(focusEvent.composed).toBe(true);
    });

    it('true when no composed', () => {
        const focusEvent = new FocusEvent('focus', { composed : false });
        expect(focusEvent.composed).toBe(true);
    });
});
